/**
 * Utility functions for playing sounds in the application
 */

/**
 * Plays a sound file from the public/sounds directory
 * @param soundFile - The name of the sound file (without path)
 * @param volume - The volume should be played (0 to 1) default is 1
 */
export const playSound = (soundFile: string,volume:number=1): void => {
  try {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = volume;
    audio.play().catch(err => console.error("Error playing sound:", err));
  } catch (error) {
    console.error("Error creating audio element:", error);
  }
};