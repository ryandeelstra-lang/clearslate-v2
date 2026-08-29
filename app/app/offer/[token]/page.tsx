import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import type { ClearanceAccount } from '../../../../core/clearance/types'
import { formatCurrency, formatDate, daysUntilExpiration } from '../../../../core/clearance/account'

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Load account data
  const dataPath = path.join(process.cwd(), '..', 'data', 'ryan-account.json')

  if (!fs.existsSync(dataPath)) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Offer Not Found</h1>
        <p className="mt-2 text-gray-600">This offer does not exist or has expired.</p>
      </div>
    </div>
  }

  const account: ClearanceAccount = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Verify token matches
  if (account.offerToken !== token) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Offer Link</h1>
        <p className="mt-2 text-gray-600">This offer link is not valid.</p>
      </div>
    </div>
  }

  const clearingAmount = formatCurrency(account.clearingAmountCents)
  const balance = formatCurrency(account.balanceCents)
  const expiresDate = formatDate(account.offerExpiresDate)
  const daysLeft = daysUntilExpiration(account.offerExpiresDate)
  const monthlyAmount = formatCurrency(Math.round(account.clearingAmountCents / 3))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-blue-600">ClearSlate</h1>
          <p className="text-sm text-gray-600">Get out of debt, for good</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-2">Your ClearSlate Offer</p>
            <p className="text-xs text-gray-500">Account: {account.originalCreditor} (...{account.id.slice(-4)})</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-8 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">{clearingAmount}</div>
              <div className="text-gray-600 mb-4">clears {balance}</div>
              <div className="text-2xl font-semibold text-green-600">Your balance becomes $0.00</div>
            </div>
          </div>

          <div className={`text-center py-3 px-4 rounded-lg ${daysLeft <= 7 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
            <p className="font-semibold">Offer expires: {expiresDate} ({daysLeft} days left)</p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-gray-900">Choose Your Payment Option</h2>

          {/* One-time payment */}
          <form action="/api/checkout" method="POST" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="method" value="one_time" />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay {clearingAmount} in full today</h3>
                <p className="text-sm text-gray-600">One payment, account cleared immediately</p>
              </div>
              <button
                type="submit"
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue →
              </button>
            </div>
          </form>

          {/* Payment plan */}
          <form action="/api/checkout" method="POST" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="method" value="plan" />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay in 3 monthly payments of {monthlyAmount}</h3>
                <p className="text-sm text-gray-600">Spread payments over 3 months</p>
              </div>
              <button
                type="submit"
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Set Up Plan →
              </button>
            </div>
          </form>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What happens next</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">1</span>
              <span>You make your payment (secure checkout)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">2</span>
              <span>We process it within 1 business day</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">3</span>
              <span>Your account balance becomes $0.00</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">4</span>
              <span>We report "paid, $0 balance" to credit bureaus</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">5</span>
              <span>You get a confirmation email with proof</span>
            </li>
          </ol>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <details className="mb-4">
            <summary className="font-semibold cursor-pointer text-gray-900 mb-2">Why is this different from a settlement?</summary>
            <p className="text-gray-700 pl-4">A settlement reduces what you owe but leaves a remaining balance. With ClearSlate, when you pay {clearingAmount}, the entire {balance} account is cleared. Balance goes to zero. Account is closed. No remaining debt.</p>
          </details>

          <details className="mb-4">
            <summary className="font-semibold cursor-pointer text-gray-900 mb-2">What if I can't afford {clearingAmount} right now?</summary>
            <p className="text-gray-700 pl-4">You can split it into 3 monthly payments of {monthlyAmount}. Or email us at help@clearslatedebit.com and let us know your situation — we want to help.</p>
          </details>

          <details className="mb-4">
            <summary className="font-semibold cursor-pointer text-gray-900 mb-2">Is this a scam?</summary>
            <p className="text-gray-700 pl-4">No. ClearSlate LLC (EIN 42-2819082) purchased your debt from {account.originalCreditor}. You can verify this by requesting validation (your legal right). We're required to provide proof within 5 days.</p>
          </details>

          <details>
            <summary className="font-semibold cursor-pointer text-gray-900 mb-2">What if I don't think I owe this?</summary>
            <p className="text-gray-700 pl-4">You have the right to dispute this debt. <a href="/dispute?token={token}" className="text-blue-600 hover:underline">Click here to dispute</a>. We'll investigate and respond within 30 days.</p>
          </details>
        </div>

      </div>
    </div>
  )
}
