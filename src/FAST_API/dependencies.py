import torch
from loguru import logger

from data_utils.generate_caption import VLM

model = None


def load_model(model_path = "Qwen/Qwen2-VL-7B-Instruct") -> None:
    global model
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    logger.info(f"Loading model from {model_path}.")

    model = VLM(model_path = model_path)

    logger.info("Model loaded.")


def get_model() -> VLM:
    global model
    return model
