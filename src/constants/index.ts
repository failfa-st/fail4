export const base = {
	default: `/** CHANGELOG
 * v1.0.0. Set up canvas
 */
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
/*
 * The draw function is called every frame to update the canvas.
 * To change the drawing logic, modify the code inside this function.
 */
function draw(){
	// TODO: Add drawing logic here
	// Set the desired FPS (frames per second) for the animation
	const FPS = 60;
	// Schedule the next frame to be drawn
	setTimeout(requestAnimationFrame(draw),1000/FPS)
}
draw();
	`.trim(),
};
