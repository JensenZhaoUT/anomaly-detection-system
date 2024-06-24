import torch
import onnx
import sys
from tool.darknet2pytorch import Darknet

def convert(cfgfile, weightfile, onnxfile):
    # Load YOLO model
    model = Darknet(cfgfile)
    model.load_weights(weightfile)
    
    # Set the model to evaluation mode
    model.eval()
    
    # Input to the model
    x = torch.randn(1, 3, model.height, model.width, requires_grad=True)
    
    # Export the model
    torch.onnx.export(model,         # model being run
                      x,             # model input (or a tuple for multiple inputs)
                      onnxfile,      # where to save the model (can be a file or file-like object)
                      export_params=True,  # store the trained parameter weights inside the model file
                      opset_version=11,    # the ONNX version to export the model to
                      do_constant_folding=True,  # whether to execute constant folding for optimization
                      input_names = ['input'],   # the model's input names
                      output_names = ['output'], # the model's output names
                      dynamic_axes={'input' : {0 : 'batch_size'},    # variable length axes
                                    'output' : {0 : 'batch_size'}})

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python convert_to_onnx.py <cfgfile> <weightfile> <onnxfile>")
        sys.exit(1)
    cfgfile = sys.argv[1]
    weightfile = sys.argv[2]
    onnxfile = sys.argv[3]
    convert(cfgfile, weightfile, onnxfile)