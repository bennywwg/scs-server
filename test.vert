#version 460

layout (location = 0) out float[4] aPos;

void main() {
    int index = 4;
    aPos[index] = 2;
}