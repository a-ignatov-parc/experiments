# Description

Different experiments with technologies, libs etc.

---

# Experiments list

1. `/canvas` – experiments with canvas
	1. `/easeljs` – experiment with EaselJS library
	1. `/blur` – experiment with discovered fast bluring technique
	1. `/videoblur` – experiment with realtime video blur using fast bluring
1. `/player` – experiments with video playback custom cross-browser behaviour
1. `/tag` – experiments with HTML tag constructor

---

## Canvas

All experiments related to canvas:

### easeljs
EaselJS API experiments. Trying to understand does this lib fit our targets.

### blur
Discovered very fast bluring technique that in theory can run in runtime

### videoblur
[Demo](http://a-ignatov-parc.github.io/experiments/canvas/videoblur/) showing previosly dicovered bluring technique trying to blur video in realtime

![Text on blurred video part](https://cloudup.com/cesy6HULb8v+)


## Player
Trying to achive custom behavour with video playback

1. Smooth forward and backward playback
1. Correct HFP (High Frame Playback) video playback and playback rate changing
1. Video tagging

A little [demo](http://a-ignatov-parc.github.io/experiments/player/)


## Tag
Created simple constructor that can emulate DOM tree operating with Objects. 

For more details see [demo](http://a-ignatov-parc.github.io/experiments/tag/)