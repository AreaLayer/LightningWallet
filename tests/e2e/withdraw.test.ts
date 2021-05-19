import testWallets from '../testWallets'
import { createBrowser, importWallet, selectSendCurrency } from './utils'

jest.setTimeout(200_000) // ms

describe('Start e2e withdraw form tests', () => {
  const checkSelectedCurrency = async (params) => {
    const { page, ticker } = params
    // a suitable example: 0.005166 ETH ($18.23)
    const feeRegExp = /(0\.)?[\d]+ [A-Z]{3,}( \(.{1}[\d(\.)?\d]+\))?/

    await selectSendCurrency({ page, ticker })

    await page.waitForSelector('#feeInfoBlockMinerFee')
    await page.waitForSelector('#feeInfoBlockAdminFee')
    await page.waitForSelector('#feeInfoBlockTotalFee')

    const minerFee = await page.$eval('#feeInfoBlockMinerFee', (el) => el.textContent)
    const adminFee = await page.$eval('#feeInfoBlockAdminFee', (el) => el.textContent)
    const totalFee = await page.$eval('#feeInfoBlockTotalFee', (el) => el.textContent)

    expect(minerFee).toBeTruthy()
    expect(totalFee).toBeTruthy()

    // expect(minerFee).toMatch(feeRegExp)
    // expect(totalFee).toMatch(feeRegExp)

    const minerAmount = parseFloat(minerFee)
    const adminAmount = parseFloat(adminFee) || 0 // if admin fee was disabled
    const totalAmount = parseFloat(totalFee)

    expect(minerAmount + adminAmount).toBeCloseTo(totalAmount)
  }

  it('the form should displayed correctly with all currencies. Correct display of commissions', async () => {
    const { browser, page } = await createBrowser()
    const arrOfWords = testWallets.eth.seedPhrase.split(' ')

    try {
      await importWallet(page, arrOfWords)
      await page.waitForTimeout(5_000)

      await checkSelectedCurrency({ page, ticker: 'btc' })
      await checkSelectedCurrency({ page, ticker: 'eth' })
      await checkSelectedCurrency({ page, ticker: 'bnb' })
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
    } finally {
      await browser.close()
    }
  })

})