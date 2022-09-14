describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        location: 'always',
        notifications: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have menu screen', async () => {
    await device.takeScreenshot('7')

    try {
      await element(by.id('get_started')).tap()
    } catch (e) {
      // skip welcome screen 
    }

    try {
      await waitFor(element(by.id('locations-list'))).toBeVisible().withTimeout(5000)
      await element(by.id('locations-list')).tap()
    } catch (e) {
      // skip locations ?
    }
    await device.takeScreenshot('8')
    try {
      await waitFor(element(by.id('items-list'))).toBeVisible().withTimeout(2000)
    } catch (e) {
      // skip menu?
    }
    await element(by.id('items-list')).tap({x:150, y:150})
    await device.takeScreenshot('9')

  });

  it('should have item screen', async () => {
    try {
      await element(by.id('locations-list')).tap({x:50, y:50})
    } catch (e) {
      // skip locations ?
    }

    try {
      await element(by.id('items-list')).tap({x:300, y:300})
    } catch (e) {
      // skip menu ?
    }

    await device.takeScreenshot('10')
  });

  it('should skip welcome screen', async () => {
    await device.takeScreenshot('20')
    try {
      await waitFor(element(by.id('get_started'))).toBeVisible().withTimeout(1500)
    } catch (e) {
      // skip locations ?
    }

    try {
      await element(by.id('get_started')).tap()
    } catch (e) {
      // skip welcome screen 
    }

    await device.takeScreenshot('21')

    try {
      await element(by.id('locations-list')).tap({x:50, y:50})
    } catch (e) {
      // skip locations ?
    }

    await device.takeScreenshot('22')

    try {
      await element(by.id('items-list')).tap({x:300, y:300})
    } catch (e) {
      // skip menu ?
    }

    await device.takeScreenshot('23')
  });

  it('should have item screen', async () => {
    try {
      await element(by.id('locations-list')).tap()
    } catch (e) {
      // skip locations ?
    }
    await element(by.id('items-list')).scroll(600, 'down')
    await device.takeScreenshot('11')
    await element(by.id('items-list')).scroll(800, 'down')
    await device.takeScreenshot('12')
    await element(by.id('items-list')).scroll(800, 'down')
    await device.takeScreenshot('13')
    await element(by.id('items-list')).scroll(800, 'down')
    await device.takeScreenshot('14')
  });

  it('should have item screen with item', async () => {
    try {
      await element(by.id('locations-list')).tap()
    } catch (e) {
      // skip locations ?
    }
    await element(by.id('items-list')).scroll(600, 'down')
    await element(by.id('items-list')).tap({ x: 100, y : 100})
    await device.takeScreenshot('15')
  });

  it('should have profile screen', async () => {
    await device.takeScreenshot('1')
    try {
      await element(by.id('go-to-menu')).tap()
    } catch(e) {
      await element(by.id('go-to-menu-header')).tap() // alternative component to click
    }
    await device.takeScreenshot('2')
    await element(by.id('menu-loyalty')).tap()
    await device.takeScreenshot('3')
    await element(by.id('field-name')).typeText("Alex")
    await element(by.id('field-phone')).typeText("6465490560")
    await device.takeScreenshot('4')
    await element(by.id('join')).tap()
    await device.takeScreenshot('5')
    await waitFor(element(by.id('lets-order'))).toBeVisible().withTimeout(15000)
    await device.takeScreenshot('6')
  });
});
