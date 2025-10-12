#thumbnail-replace.py - for each thumbnail in a directory, strips underscore from the thumbnail-name, replaces the full-size image, and  - effect is to replace full-size image with a thumnail version having THE SAME NAME, which is the name expected by channels.html
###NOTE: thumbnails are initialy created from 'image.ext' as 'image_.ext
###Names expected by channels.html are without underscores - i.e. 'image.ext'

import os
import sys
from PIL import Image


def rename_thumbnail(image_path):
    try:    
        #strip image-type suffix from image_path
        image_branch, ext = os.path.splitext(image_path)
        if(image_branch.endswith('_') is False):
            print('image already has expected name')
            return

        #thumbnail path
        new_branch = image_branch[:-1]
        thumbnail_path = new_branch + ext

        # Open the image_
        image = Image.open(image_path)
       
        # Save the thumbnail
        image.save(thumbnail_path)
        print(f"thumbnail renamed {thumbnail_path}")

        #remove previous underscore version
        if os.path.exists(image_path):
            os.remove(image_path)
            print(f"{image_path} has been deleted.")
        else:
            print(f"{image_path} does not exist.")       

    except Exception as e:
        print("Error:", e)



def read_directory(directory_path):
    # Check if the directory exists
    if not os.path.isdir(directory_path):
        print("Error: Directory does not exist.")
        return

    # Loop over all files in the directory
    for filename in os.listdir(directory_path):
        image_path = os.path.join(directory_path, filename)
        if os.path.isfile(image_path):
            print("\n*** initial image_path:", image_path)
            rename_thumbnail(image_path)



if __name__ == "__main__":
    # Check if a directory path is provided as a command-line argument
    if len(sys.argv) != 2:
        print("Usage: thumbnail-rename.py <rel-path-to image_directory>")
        print("Exp: thumbnail-rename.py '../post/7/'")
    else:
        directory_path = sys.argv[1]
        read_directory(directory_path)


