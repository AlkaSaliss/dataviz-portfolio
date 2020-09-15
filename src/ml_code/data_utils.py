from torch.utils.data import DataLoader, Dataset
from torchvision import transforms


class MnistDataset(Dataset):
	def __init__(self, X, y=None, transf=None):
		self.X = torch.tensor(X).float()
		self.y = torch.tensor(y).long() if y else y
		self.transf = transf

	def __len__(self):
		return len(self.X)
	
	def __getitem__(self, idx):
		x = self.X[idx]
		if self.transf:
			x = self.transf(x)
		if self.y:
			label = self.y[idx]
			return x, label
		return x

def get_dataloader(dataset, batch_size, is_train=True, num_workers=8):
	dl = DataLoader(dataset, batch_size, is_train, num_workers=num_workers, pin_memory=True)
	return dl
