# NSCanvasCyberDemo
A Clunky Cyberpunk Demo for Nativescript Canvas 1.1

A Few notes:

- Besides i stripped some comments from shaders they are MIT licensed as I lil adapted it from shadertoy, im not the original creator of them, don´t credit me for that, maybe would be a good practice reinsert those mit comments on each one, I tried to keep it small for educational purposes
- Tested only in Android at moment... heard about some issue with iOS running of this demo

The code is not too pretty, also shoud note few more points:

- For some misterious reason (idk if it´s related to context 2d timer bug) the first message randomly fails to appear in time and just fade out soon, probably i prevented it using a dummy previous message to wake up that
- My function to drop resolution and gain performance called (setPixelRatioTHREE) is far from professional at moment... as it doesn´t deals with changing again the size forth back, maybe if not start at xml size and creating all by js is the first step to improve things, but my mind was already hurting.
- For some reason (that I never seen before) nslogo at the ending scene seems like not respecting depth as if it was hollow...
- For some obscure reason I think i seen the music getting desynchronized when suspending sometimes, even with pausing it on suspend
- Nativescript Audio Player "loop: true" still not fixed until today, so i detect the intro music ended to replay it.

So... as @NathanWalker mentioned, this repo can be used to do some test and tweaks, helping to fix bugs and also contributing for the process of streamline NSCanvas across multiplatforms.
