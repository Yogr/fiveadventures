/**
 * Utility functions for fighter display scaling
 */

/**
 * Calculate the width of a fighter based on base width and scale
 * @param baseWidth The base width of the fighter image
 * @param scale The scale factor to apply
 * @returns The calculated width
 */
export function getFighterWidth(baseWidth: number, scale: number): number {
  return Math.round(baseWidth * scale);
}

/**
 * Calculate the height of a fighter based on base height and scale
 * @param baseHeight The base height of the fighter image
 * @param scale The scale factor to apply
 * @returns The calculated height
 */
export function getFighterHeight(baseHeight: number, scale: number): number {
  return Math.round(baseHeight * scale);
}

/**
 * Calculate the shadow width based on the scale
 * @param baseWidth The base width of the shadow
 * @param scale The scale factor to apply
 * @returns The calculated shadow width
 */
export function getShadowWidth(baseWidth: number, scale: number): number {
  return Math.round(baseWidth * scale);
}

/**
 * Calculate the shadow height based on the scale
 * @param baseHeight The base height of the shadow
 * @param scale The scale factor to apply
 * @returns The calculated shadow height
 */
export function getShadowHeight(baseHeight: number, scale: number): number {
  return Math.round(baseHeight * scale);
}

/**
 * Calculate the container width based on the fighter width and scale
 * @param baseWidth The base width of the container
 * @param scale The scale factor to apply
 * @returns The calculated container width
 */
export function getContainerWidth(baseWidth: number, scale: number): number {
  // Make container slightly larger than the fighter to account for overflow
  return Math.round(baseWidth * scale * 1.2);
}

/**
 * Calculate the container height based on the fighter height and scale
 * @param baseHeight The base height of the container
 * @param scale The scale factor to apply
 * @returns The calculated container height
 */
export function getContainerHeight(baseHeight: number, scale: number): number {
  // Make container slightly larger than the fighter to account for overflow
  return Math.round(baseHeight * scale * 1.2);
}
