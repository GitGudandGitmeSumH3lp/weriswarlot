import { extend } from '@pixi/react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';

// Register the PixiJS primitives we need
extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

// No export needed, just importing this file runs the code.