import { Suspense } from 'react'

function SuccessContent({ searchParams }: { searchParams: { session_id?: string; plan?: string } }) {
  const isPlan = searchParams.plan === 'true'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success checkmark */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isPlan ? 'Payment Plan Set Up!' : 'Payment Received!'}
          </h1>

          {isPlan ? (
            <>
              <p className="text-lg text-gray-700 mb-6">
                Your payment plan is active. Your first payment has been processed.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 text-left mb-6">
                <h2 className="font-semibold text-gray-900 mb-2">What happens next:</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ First payment processed today</li>
                  <li>→ Two more monthly payments will be charged automatically</li>
                  <li>→ After your final payment, your account balance becomes $0.00</li>
                  <li>→ You'll receive a confirmation email</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-700 mb-6">
                We're processing your payment. Your account will be cleared within 1 business day.
              </p>
              <div className="bg-green-50 border-l-4 border-green-600 p-6 text-left mb-6">
                <h2 className="font-semibold text-gray-900 mb-2">What happens next:</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Payment received</li>
                  <li>→ Account balance becomes $0.00 (within 1 business day)</li>
                  <li>→ Reported to credit bureaus as "paid, $0 balance"</li>
                  <li>→ Confirmation email sent with proof</li>
                </ul>
              </div>
            </>
          )}

          <p className="text-gray-600 mb-4">
            Check your email for confirmation and next steps.
          </p>

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500">
              Questions? Email us at <a href="mailto:help@clearslatedebit.com" className="text-blue-600 hover:underline">help@clearslatedebit.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string; plan?: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent searchParams={searchParams as any} />
    </Suspense>
  )
}
