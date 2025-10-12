### Cantor3D Variations

#####New Hole Customization Controls:
1. Hole Size Control:
glslconst float HOLE_SIZE = 0.5;     // 1.0 = original size, 0.5 = smaller, 1.5 = larger
2. Hole Shape Control:
glslconst int HOLE_SHAPE = 0;        // 0=square, 1=circle, 2=triangle, 3=hexagon
Four Different Hole Shapes:

Square (HOLE_SHAPE = 0): Original Menger sponge holes
Circle (HOLE_SHAPE = 1): Cylindrical holes using length()
Triangle (HOLE_SHAPE = 2): Triangular holes with proper edge calculations
Hexagon (HOLE_SHAPE = 3): Hexagonal holes using hex distance functions

How to Use:
Make holes larger:
glslconst float HOLE_SIZE = 1.5;     // 50% larger holes
Make holes smaller:
glslconst float HOLE_SIZE = 0.3;     // 70% smaller holes


##### New shapes:

glslconst int HOLE_SHAPE = 1;        // Circular holes
const int HOLE_SHAPE = 2;        // Triangular holes  
const int HOLE_SHAPE = 3;        // Hexagonal holes

##### Combination Examples:

HOLE_SIZE = 1.8 + HOLE_SHAPE = 1 = Large circular holes
HOLE_SIZE = 0.4 + HOLE_SHAPE = 2 = Small triangular holes
HOLE_SIZE = 1.2 + HOLE_SHAPE = 3 = Medium hexagonal holes

The triangular and hexagonal shapes will create really interesting geometric patterns in the fractal structure! You can experiment with different combinations to create unique Menger sponge variations.
