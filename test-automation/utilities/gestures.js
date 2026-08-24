const logger = require('./logger');

class Gestures {
  static async tap(driver, elementOrSelector) {
    logger.info('Executing Gesture: Tap');
    const el = typeof elementOrSelector === 'string' ? await driver.$(elementOrSelector) : elementOrSelector;
    await el.click();
  }

  static async doubleTap(driver, element) {
    logger.info('Executing Gesture: Double Tap');
    await driver.action('pointer')
      .move({ origin: element })
      .down()
      .up()
      .pause(100)
      .down()
      .up()
      .perform();
  }

  static async longPress(driver, element, durationMs = 1500) {
    logger.info(`Executing Gesture: Long Press (${durationMs}ms)`);
    await driver.action('pointer')
      .move({ origin: element })
      .down()
      .pause(durationMs)
      .up()
      .perform();
  }

  static async swipe(driver, startX, startY, endX, endY, durationMs = 800) {
    logger.info(`Executing Gesture: Swipe from (${startX},${startY}) to (${endX},${endY})`);
    await driver.action('pointer')
      .move({ x: startX, y: startY })
      .down()
      .pause(durationMs)
      .move({ x: endX, y: endY })
      .up()
      .perform();
  }

  static async scroll(driver, direction = 'down') {
    logger.info(`Executing Gesture: Scroll ${direction}`);
    const { width, height } = await driver.getWindowSize();
    const startX = width / 2;
    const startY = direction === 'down' ? height * 0.8 : height * 0.2;
    const endY = direction === 'down' ? height * 0.2 : height * 0.8;
    await this.swipe(driver, startX, startY, startX, endY);
  }

  static async dragAndDrop(driver, sourceElement, targetElement) {
    logger.info('Executing Gesture: Drag and Drop');
    const sourceRect = await sourceElement.getRect();
    const targetRect = await targetElement.getRect();

    await driver.action('pointer')
      .move({ x: sourceRect.x + sourceRect.width / 2, y: sourceRect.y + sourceRect.height / 2 })
      .down()
      .pause(500)
      .move({ x: targetRect.x + targetRect.width / 2, y: targetRect.y + targetRect.height / 2 })
      .up()
      .perform();
  }

  static async pinch(driver) {
    logger.info('Executing Gesture: Pinch');
    const { width, height } = await driver.getWindowSize();
    const cx = width / 2;
    const cy = height / 2;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        actions: [
          { type: 'pointerMove', x: cx - 200, y: cy },
          { type: 'pointerDown' },
          { type: 'pointerMove', x: cx - 50, y: cy, duration: 500 },
          { type: 'pointerUp' }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        actions: [
          { type: 'pointerMove', x: cx + 200, y: cy },
          { type: 'pointerDown' },
          { type: 'pointerMove', x: cx + 50, y: cy, duration: 500 },
          { type: 'pointerUp' }
        ]
      }
    ]);
  }

  static async zoom(driver) {
    logger.info('Executing Gesture: Zoom');
    const { width, height } = await driver.getWindowSize();
    const cx = width / 2;
    const cy = height / 2;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        actions: [
          { type: 'pointerMove', x: cx - 50, y: cy },
          { type: 'pointerDown' },
          { type: 'pointerMove', x: cx - 200, y: cy, duration: 500 },
          { type: 'pointerUp' }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        actions: [
          { type: 'pointerMove', x: cx + 50, y: cy },
          { type: 'pointerDown' },
          { type: 'pointerMove', x: cx + 200, y: cy, duration: 500 },
          { type: 'pointerUp' }
        ]
      }
    ]);
  }
}

module.exports = Gestures;
