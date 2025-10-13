#thumbnail-file.py - create thumbnail from full-size image

from PIL import Image
import sys
import os


def create_thumbnail(image_path, thumbnail_size=(256, 256)):
    try:    
        #strip image-type suffix from image_path
        image_branch, ext = os.path.splitext(image_path)
        if(image_branch.endswith('_')):
            print('this image is already a thumbnail')
            return

        #thumbnail path
        thumbnail_path = image_branch + '_' + ext

        # Open the full-size image
        image = Image.open(image_path)
        
        # Create a thumbnail
        image.thumbnail(thumbnail_size)
        
        # Save the thumbnail
        image.save(thumbnail_path)
        
        print(f"created thumbnail-image  ${thumbnail_path}")
    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    # Check if a directory path is provided as a command-line argument
    if len(sys.argv) != 2:
        print("Usage: thumbnail-file.py <rel-path-to image>")
        print("Exp: thumbnail-file.py '../post/7/post7_2.png'")
    else:
        image_path = sys.argv[1]
        create_thumbnail(image_path)

