import os
import glob
import torch
import torch.nn as nn
from ignite.metrics import Loss, Accuracy
from ignite.engine import Events, create_supervised_evaluator, create_supervised_trainer
from ignite.contrib.handlers import ProgressBar
from ignite.handlers import ModelCheckpoint, EarlyStopping
from ignite.contrib.handlers.tensorboard_logger import OutputHandler, TensorboardLogger
import random
import numpy as np

# random.seed(123)
# np.random.seed(123)
# torch.manual_seed(123)
# torch.cuda.manual_seed_all(123)
# torch.backends.cudnn.deterministic = True
# torch.backends.cudnn.benchmark = False


class LabelSmoothingCrossentropy(nn.Module):
	def __init__(self, eps=0.1):
		super(LabelSmoothingCrossentropy, self).__init__()
		self.eps = eps
	def forward(self, output, target):
		num_classes = output.size()[-1]
		# compute log preds
		log_preds = nn.functional.log_softmax(output, dim=-1)
		loss1 = -log_preds.sum(dim=-1)
		loss1 = loss1.mean() * self.eps/num_classes
		loss2 = (1-self.eps) * nn.functional.nll_loss(log_preds, target.long(), reduction="mean")
		return loss1 + loss2


def run_training(model, optimizer, train_loader, val_loader, epochs, patience, ckpt_dir, fname, log_dir, scheduler=None, label_smooth=0.0):
    
	crit = nn.CrossEntropyLoss() if label_smooth <= 0.0 else LabelSmoothingCrossentropy(label_smooth)
	metrics = {"loss": Loss(crit), "acc": Accuracy()}
	# trainer
	device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
	trainer = create_supervised_trainer(model, optimizer, crit, device=device)
	train_evaluator = create_supervised_evaluator(model, metrics=metrics, device=device)
	val_evaluator = create_supervised_evaluator(model, metrics=metrics, device=device)
	
	# callbacks
	
	# tensorboard
	tb_logger = TensorboardLogger(log_dir=log_dir)
	tb_logger.attach(train_evaluator, log_handler=OutputHandler(tag="training", metric_names=["loss", "acc"], another_engine=trainer), event_name=Events.EPOCH_COMPLETED)
	tb_logger.attach(val_evaluator, log_handler=OutputHandler(tag="validation", metric_names=["loss", "acc"], another_engine=trainer), event_name=Events.EPOCH_COMPLETED)
	
	pbar = ProgressBar(persist=True)
	pbar.attach(trainer, metric_names="all")

	@trainer.on(Events.EPOCH_COMPLETED)
	def log_training_results(engine):
		train_evaluator.run(train_loader)
		val_evaluator.run(val_loader)
		train_loss = train_evaluator.state.metrics["loss"]
		val_loss = val_evaluator.state.metrics["loss"]
		train_acc = train_evaluator.state.metrics["acc"]
		val_acc = val_evaluator.state.metrics["acc"]
		pbar.log_message(f"Training Results - Epoch: {engine.state.epoch}  Loss: {train_loss:.6f}  Accuracy: {train_acc:.4f}")
		pbar.log_message(f"Validation Results - Epoch: {engine.state.epoch}  Loss: {val_loss:.6f}  Accuracy: {val_acc:.4f}")

	def get_val_loss(engine):
		val_loss = engine.state.metrics['loss']
		return -val_loss

	checkpointer = ModelCheckpoint(ckpt_dir, fname, score_function=get_val_loss, score_name="loss", require_empty=False)
	early_stopper = EarlyStopping(patience, get_val_loss, trainer)
	val_evaluator.add_event_handler(Events.EPOCH_COMPLETED, checkpointer,
										{'optimizer': optimizer, 'model': model})
	val_evaluator.add_event_handler(Events.EPOCH_COMPLETED, early_stopper)
	if scheduler:
		trainer.add_event_handler(Events.ITERATION_COMPLETED, lambda engine: scheduler.step())
	
	# def empty_cuda_cache(_):
	# 	torch.cuda.empty_cache()
	# 	import gc
	# 	gc.collect()
	# if torch.cuda.is_available():
	# 	trainer.add_event_handler(Events.EPOCH_COMPLETED, empty_cuda_cache)
	
	trainer.run(train_loader, max_epochs=epochs)
	tb_logger.close()
	
	# Evaluation with best model
	model.load_state_dict(torch.load(glob.glob(os.path.join(ckpt_dir, "*.pth"))[0])["model"])
	train_evaluator = create_supervised_evaluator(model, metrics=metrics, device=device)
	val_evaluator = create_supervised_evaluator(model, metrics=metrics, device=device)
	
	train_evaluator.run(train_loader)
	val_evaluator.run(val_loader)

	train_metrics = {
		"train_loss": train_evaluator.state.metrics["loss"],
		"val_loss": val_evaluator.state.metrics["loss"],
		"train_acc": train_evaluator.state.metrics["acc"],
		"val_acc": val_evaluator.state.metrics["acc"]
	}
	return train_metrics


def create_train_folders(root_folder):
	ckpt_dir = os.path.join(root_folder, "cpkts")
	os.makedirs(ckpt_dir, exist_ok=True)
	log_dir = os.path.join(root_folder, "logs")
	os.makedirs(log_dir, exist_ok=True)
	return ckpt_dir, log_dir