#thumbnail-dir.py - create thumbnails from all full-size images in a directory

import os
import sys
from PIL import Image

def create_thumbnail(image_path, thumbnail_size=(256,256)):
    try:    
        #strip image-type suffix from image_path
        image_branch, ext = os.path.splitext(image_path)
        if(image_branch.endswith('_')):
            return

        #thumbnail path
        thumbnail_path = image_branch + '_' + ext

        # Open the full-size image
        image = Image.open(image_path)
        
        # Create a thumbnail
        image.thumbnail(thumbnail_size)
        
        # Save the thumbnail
        image.save(thumbnail_path)
        
        print(f"created thumbnail  {thumbnail_path}")
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
            print("\n*** image_path:", image_path)
            create_thumbnail(image_path)



if __name__ == "__main__":
    # Check if a directory path is provided as a command-line argument
    if len(sys.argv) != 2:
        print("Usage: thumbnail.py <rel-path-to image_directory>")
        print("Exp: thumbnail.py '../post/7/'")
    else:
        directory_path = sys.argv[1]
        read_directory(directory_path)


