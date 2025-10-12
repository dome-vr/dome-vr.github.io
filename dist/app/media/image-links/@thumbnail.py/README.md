#Workflow for replacing full-size screen captures by thumbnails to be displayed in channels.html
####[1a] create a thumbnail for a particular full-size-image-path  (relative to the execution directory) 
#####OR
####[1b] create thumbnails for all full-size images in a particular directory-path (relative to the execution directory) 
#####FINALLY

####[2] replace the full-size image with the thumbnail and give the thumbnail the initial full-size image  name (the name expected by channels.html) and delete both the underscore-thumbnail and the full-size image (if it existed) 

<br><br>



##[1a] thumbnail-file.py
## usage
```
@thumbnail.py> py thumbnail-file.py  <relative-path-to full-size image>
exp: @thumbnail.py> thumbnail-file.py '../4/sparkling-spherepointcloud.png'
```
## result
Creates thumbnail in same directory with name [image-name]_.ext
```
exp: '../4/sparkling-spherepointcloud_.png'
```

#[1b] thumbnail-dir.py

## usage
```
@thumbnail.py> thumbnail.py  <relative-path-to directory of full-size image(s)>
exp: @thumbnail.py> py thumbnail.py '../7/'
```
## result
For each image in directory creates a thumbnail with name [image-name]_.ext
```
exp: '../7/pointcloudlinespost-rmexpt1post-vrskybox7_.png'
     '../7/pointcloudlinespost-rmexpt1-vrskybox7_.png'
     ...
```

#[2] thumbnail-replace.py

## usage
```
@thumbnail.py> thumbnail-replace.py  <relative-path-to directory of underscore-named thumbnail(s)>
exp: @thumbnail.py> py thumbnail-replace.py '../7/'
```
## result
For each underscore-thumbnail in directory is renamed without the underscore, and overwrites the original full-size image of the same name if it exists. The thumbnail has the final name [image-name].ext, which is the name expected by channels.html
```
exp: '../7/pointcloudlinespost-rmexpt1post-vrskybox7.png'
     '../7/pointcloudlinespost-rmexpt1-vrskybox7.png'
     ...
```


