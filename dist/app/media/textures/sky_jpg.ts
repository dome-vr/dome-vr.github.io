export var sky_jpg;
(new THREE.TextureLoader()).load('./images/sky.jpg', function(texture){
  sky_jpg = texture;
});
