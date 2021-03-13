import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from torchvision import transforms
import numpy as np
from skimage.transform import resize as sk_resize
from skimage import exposure


# Utility classes for applying custom transformations to images
class AddChannel(object):
    def __call__(self, im):
        return np.expand_dims(im, 2)


class HistEq(object):
    def __call__(self, im):
        return exposure.equalize_hist(im)


class ToRGB(object):
    def __call__(self, im):
        if len(im.shape) < 3:
            im = np.expand_dims(im, 2)
        return np.repeat(im, 3, axis=2)


class SkResize(object):
    def __init__(self, size):
        self.size = size

    def __call__(self, im, size=None):
        return sk_resize(im, self.size)


def _scale_channel(img_chan):
	"""Histogram equalization"""
	# from https://github.com/pytorch/vision/blob/83171d6ac95e6bf633bcba3fdd1606f1c8c6bf8b/torchvision/transforms/functional_tensor.py#L1299-L1313
	hist = torch.histc(img_chan.to(torch.float32), bins=256, min=0, max=255)
	nonzero_hist = hist[hist != 0]
	step = nonzero_hist[:-1].sum() // 255
	if step == 0:
		return img_chan

	lut = (torch.cumsum(hist, 0) + (step // 2)) // step
	lut = torch.nn.functional.pad(lut, [1, 0])[:-1].clamp(0, 255)

	return lut[img_chan.to(torch.int64)].to(torch.uint8)


def preprocess_fer(x):
	x = x[:, :, 0]*0.299 + x[:, :, 1]*0.587 + x[:, :, 2]*0.114  # rgb to gray : https://docs.opencv.org/3.1.0/de/d25/imgproc_color_conversions.html
	x = x.view((1, 1, *x.size())).float()
	x = F.interpolate(x, (48, 48))
	# x = x.view((x.size()[2], x.size()[3]))
	# x = _scale_channel(x)
	# x = x.view((1, 1, *x.size()))
	return ((x.repeat((1, 3, 1, 1))-x.min())/(x.max()-x.min())).float()


def preprocess_utk(x):
	x = x.transpose(1, -1).transpose(0, 1).float().unsqueeze(0)
	x = F.interpolate(x, (128, 128))
	return ((x-x.min())/(x.max()-x.min())).float()


def set_parameter_requires_grad(model, feature_extracting):
    """
    Utility function for setting parameters gradient collection to true (finetuning) or false (features extraction)
    :param model: pytorch nn.Module class or subclass
    :param feature_extracting: boolean. If True don't collect gradients for the module's parameters
    :return:
    """
    if feature_extracting:
        for param in model.parameters():
            param.requires_grad = False


def initialize_model(model_name, feature_extract, num_classes=7, task='fer2013', use_pretrained=True):
    """
    Instantiate a pytorch model loading eventually pretrained weights from torchvision models zoo
    :param model_name: string indicating model name; valid candidates are `resnet`, `vgg`, `densenet`,
            `squeezenet`, `inception`, `alexnet`
    :param feature_extract: boolean. If True don't collect gradients for the module's parameters
    :param num_classes: number of classes to add for the classification layer
    :param task: string indicating whether we are performing emotion detection or age/gender/race classification.
            in the 1st case (task='fer2013') we just need to replace the classification using the right number of
             classes. In the 2nd case we add a dense layer of size 128, and do not add classification layer as it is a
            multitask task.
    :param use_pretrained: boolean, whether to load pretrained weights trained on imagenet
    :return: a pytorch model and the input size, typically 224 or 229 as different pretrained models may have
            different input image size.
    """

    # Initialize these variables which will be set in this if statement. Each of these
    #   variables is model specific.
    model_ft = None
    input_size = 0

    if model_name == "resnet":
        """ Resnet 50
        """
        model_ft = models.resnet50(pretrained=use_pretrained)
        set_parameter_requires_grad(model_ft, feature_extract)
        num_ftrs = model_ft.fc.in_features
        if task == 'fer2013':
            model_ft.fc = nn.Linear(num_ftrs, num_classes)
        else:
            model_ft.fc = nn.Linear(num_ftrs, 128)
        input_size = 224

    elif model_name == "alexnet":
        """ Alexnet
        """
        model_ft = models.alexnet(pretrained=use_pretrained)
        set_parameter_requires_grad(model_ft, feature_extract)
        num_ftrs = model_ft.classifier[6].in_features
        if task == 'fer2013':
            model_ft.classifier[6] = nn.Linear(num_ftrs, num_classes)
        else:
            model_ft.classifier[6] = nn.Linear(num_ftrs, 128)
        input_size = 224

    elif model_name == "vgg":
        """ VGG19
        """
        model_ft = models.vgg19_bn(pretrained=use_pretrained)
        set_parameter_requires_grad(model_ft, feature_extract)
        num_ftrs = model_ft.classifier[6].in_features
        if task == 'fer2013':
            model_ft.classifier[6] = nn.Linear(num_ftrs, num_classes)
        else:
            model_ft.classifier[6] = nn.Linear(num_ftrs, 128)
        input_size = 224

    elif model_name == "squeezenet":
        """ Squeezenet
        """
        model_ft = models.squeezenet1_0(pretrained=use_pretrained)
        set_parameter_requires_grad(model_ft, feature_extract)
        model_ft.classifier[1] = nn.Conv2d(
            512, num_classes, kernel_size=(1, 1), stride=(1, 1))
        model_ft.num_classes = num_classes
        input_size = 224

    elif model_name == "densenet":
        """ Densenet
        """
        model_ft = models.densenet121(pretrained=use_pretrained)
        set_parameter_requires_grad(model_ft, feature_extract)
        num_ftrs = model_ft.classifier.in_features
        if task == 'fer2013':
            model_ft.classifier = nn.Linear(num_ftrs, num_classes)
        else:
            model_ft.classifier = nn.Linear(num_ftrs, 128)
        input_size = 224

    elif model_name == "inception":
        """ Inception v3
        Be careful, expects (299,299) sized images and has auxiliary output
        """
        model_ft = models.inception_v3(pretrained=use_pretrained)
        set_parameter_requires_grad(model_ft, feature_extract)
        # Handle the auxiliary net
        num_ftrs = model_ft.AuxLogits.fc.in_features
        model_ft.AuxLogits.fc = nn.Linear(num_ftrs, num_classes)
        # Handle the primary net
        num_ftrs = model_ft.fc.in_features
        model_ft.fc = nn.Linear(num_ftrs, num_classes)
        input_size = 299

    else:
        print("Invalid model name, exiting...")
        exit()

    return model_ft, input_size


class PretrainedMT(nn.Module):
    """Pretrained Pytorch neural network module for multitask learning"""

    def __init__(self, model_name='resnet', feature_extract=True, use_pretrained=True):
        super(PretrainedMT, self).__init__()
        self.conv_base, input_size = initialize_model(model_name, feature_extract, num_classes=None,
                                                      task='utk', use_pretrained=use_pretrained)
        self.output_age = nn.Linear(128, 1)
        self.output_gender = nn.Linear(128, 2)
        self.output_race = nn.Linear(128, 5)

    def forward(self, x):
        x = self.conv_base(x)
        age = self.output_age(x)
        gender = self.output_gender(x)
        race = self.output_race(x)
        return age, gender, race
