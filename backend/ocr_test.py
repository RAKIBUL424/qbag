from PIL import Image

im_file = "../frontend/images/Capture3.PNG"

im = Image.open(im_file)
print(im)
print(im.size)
print(im.show())