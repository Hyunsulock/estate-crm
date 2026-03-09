import { createRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { calculatorApi, commissionApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calculator,
  TrendingUp,
  Building2,
  Percent,
  PiggyBank,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type { PropertyType, TransactionType, PricePerPyeongResult, YieldResult, LoanResult, TaxResult, CommissionBreakdown } from '@/types'

type CalculatorTab = 'pricePerPyeong' | 'yield' | 'loan' | 'commission' | 'tax'

function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('pricePerPyeong')

  // 평단가 계산 상태
  const [priceInput, setPriceInput] = useState('')
  const [areaInput, setAreaInput] = useState('')
  const [pricePerPyeongResult, setPricePerPyeongResult] = useState<PricePerPyeongResult | null>(null)

  // 수익률 계산 상태
  const [yieldInputs, setYieldInputs] = useState({
    purchasePrice: '',
    monthlyRent: '',
    deposit: '',
    monthlyExpenses: '',
    currentPrice: '',
  })
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null)

  // 대출 계산 상태
  const [loanInputs, setLoanInputs] = useState({
    propertyPrice: '',
    downPayment: '',
    interestRate: '4.5',
    loanTermYears: '30',
    repaymentType: 'equalPayment' as 'equalPrincipal' | 'equalPayment' | 'bullet',
  })
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  // 중개수수료 계산 상태
  const [commissionInputs, setCommissionInputs] = useState({
    transactionType: 'sale' as TransactionType,
    transactionAmount: '',
    monthlyRent: '',
  })
  const [commissionResult, setCommissionResult] = useState<CommissionBreakdown | null>(null)

  // 취득세 계산 상태
  const [taxInputs, setTaxInputs] = useState({
    propertyPrice: '',
    propertyType: 'apartment' as PropertyType,
    isFirstHome: true,
    numberOfHomes: '0',
  })
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null)

  // API 뮤테이션
  const pricePerPyeongMutation = useMutation({
    mutationFn: ({ price, area }: { price: number; area: number }) =>
      calculatorApi.calculatePricePerPyeong(price, area),
    onSuccess: (result) => setPricePerPyeongResult(result),
  })

  const yieldMutation = useMutation({
    mutationFn: calculatorApi.calculateYield,
    onSuccess: (result) => setYieldResult(result),
  })

  const loanMutation = useMutation({
    mutationFn: calculatorApi.calculateLoan,
    onSuccess: (result) => setLoanResult(result),
  })

  const commissionMutation = useMutation({
    mutationFn: ({ transactionType, transactionAmount, monthlyRent }: {
      transactionType: TransactionType
      transactionAmount: number
      monthlyRent?: number
    }) => commissionApi.calculate(transactionType, transactionAmount, monthlyRent),
    onSuccess: (result) => setCommissionResult(result),
  })

  const taxMutation = useMutation({
    mutationFn: calculatorApi.calculateAcquisitionTax,
    onSuccess: (result) => setTaxResult(result),
  })

  // 금액 포맷팅
  const formatPrice = (value: number): string => {
    if (value >= 100000000) {
      const uk = Math.floor(value / 100000000)
      const man = Math.floor((value % 100000000) / 10000)
      return man > 0 ? `${uk}억 ${man.toLocaleString()}만원` : `${uk}억원`
    } else if (value >= 10000) {
      return `${Math.floor(value / 10000).toLocaleString()}만원`
    }
    return `${value.toLocaleString()}원`
  }

  // 평단가 계산
  const handleCalculatePricePerPyeong = () => {
    const price = parseFloat(priceInput.replace(/,/g, '')) * 10000 // 만원 단위
    const area = parseFloat(areaInput)
    if (price > 0 && area > 0) {
      pricePerPyeongMutation.mutate({ price, area })
    }
  }

  // 수익률 계산
  const handleCalculateYield = () => {
    const purchasePrice = parseFloat(yieldInputs.purchasePrice.replace(/,/g, '')) * 10000
    const monthlyRent = parseFloat(yieldInputs.monthlyRent.replace(/,/g, '')) * 10000 || 0
    const deposit = parseFloat(yieldInputs.deposit.replace(/,/g, '')) * 10000 || 0
    const monthlyExpenses = parseFloat(yieldInputs.monthlyExpenses.replace(/,/g, '')) * 10000 || 0
    const currentPrice = yieldInputs.currentPrice
      ? parseFloat(yieldInputs.currentPrice.replace(/,/g, '')) * 10000
      : undefined

    if (purchasePrice > 0) {
      yieldMutation.mutate({
        purchasePrice,
        monthlyRent,
        deposit,
        monthlyExpenses,
        currentPrice,
      })
    }
  }

  // 대출 계산
  const handleCalculateLoan = () => {
    const propertyPrice = parseFloat(loanInputs.propertyPrice.replace(/,/g, '')) * 10000
    const downPayment = parseFloat(loanInputs.downPayment.replace(/,/g, '')) * 10000
    const interestRate = parseFloat(loanInputs.interestRate)
    const loanTermYears = parseInt(loanInputs.loanTermYears)

    if (propertyPrice > 0 && downPayment >= 0 && interestRate > 0 && loanTermYears > 0) {
      loanMutation.mutate({
        propertyPrice,
        downPayment,
        interestRate,
        loanTermYears,
        repaymentType: loanInputs.repaymentType,
      })
    }
  }

  // 중개수수료 계산
  const handleCalculateCommission = () => {
    const transactionAmount = parseFloat(commissionInputs.transactionAmount.replace(/,/g, '')) * 10000
    const monthlyRent = commissionInputs.monthlyRent
      ? parseFloat(commissionInputs.monthlyRent.replace(/,/g, '')) * 10000
      : undefined

    if (transactionAmount > 0) {
      commissionMutation.mutate({
        transactionType: commissionInputs.transactionType,
        transactionAmount,
        monthlyRent,
      })
    }
  }

  // 취득세 계산
  const handleCalculateTax = () => {
    const propertyPrice = parseFloat(taxInputs.propertyPrice.replace(/,/g, '')) * 10000

    if (propertyPrice > 0) {
      taxMutation.mutate({
        propertyPrice,
        propertyType: taxInputs.propertyType,
        isFirstHome: taxInputs.isFirstHome,
        numberOfHomes: parseInt(taxInputs.numberOfHomes) || 0,
      })
    }
  }

  const tabs: { id: CalculatorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pricePerPyeong', label: '평단가', icon: <Building2 className="h-4 w-4" /> },
    { id: 'yield', label: '수익률', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'loan', label: '대출', icon: <PiggyBank className="h-4 w-4" /> },
    { id: 'commission', label: '중개수수료', icon: <Percent className="h-4 w-4" /> },
    { id: 'tax', label: '취득세', icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">부동산 계산기</h1>
          <p className="text-gray-500 text-sm">평단가, 수익률, 대출, 수수료, 취득세 계산</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* 평단가 계산기 */}
      {activeTab === 'pricePerPyeong' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              평단가 계산
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">매매가 (만원)</label>
                <Input
                  placeholder="예: 80000 (8억)"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9,]/g, ''))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">전용면적 (㎡)</label>
                <Input
                  placeholder="예: 84.5"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCalculatePricePerPyeong}
                disabled={!priceInput || !areaInput}
              >
                계산하기
              </Button>
            </div>
          </Card>

          {pricePerPyeongResult && (
            <Card className="p-6 bg-blue-50">
              <h3 className="font-semibold mb-4">계산 결과</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 매매가</span>
                  <span className="font-medium">{formatPrice(pricePerPyeongResult.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">전용면적</span>
                  <span className="font-medium">
                    {pricePerPyeongResult.areaSqm}㎡ ({pricePerPyeongResult.areaPyeong}평)
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-blue-600">평당 가격</span>
                  <span className="font-bold text-blue-600">
                    {formatPrice(pricePerPyeongResult.pricePerPyeong)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>㎡당 가격</span>
                  <span>{formatPrice(pricePerPyeongResult.pricePerSqm)}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 수익률 계산기 */}
      {activeTab === 'yield' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              수익률 계산
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">매입가 (만원) *</label>
                <Input
                  placeholder="예: 80000 (8억)"
                  value={yieldInputs.purchasePrice}
                  onChange={(e) =>
                    setYieldInputs({ ...yieldInputs, purchasePrice: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">월세 수입 (만원)</label>
                <Input
                  placeholder="예: 150"
                  value={yieldInputs.monthlyRent}
                  onChange={(e) =>
                    setYieldInputs({ ...yieldInputs, monthlyRent: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">보증금 (만원)</label>
                <Input
                  placeholder="예: 10000 (1억)"
                  value={yieldInputs.deposit}
                  onChange={(e) =>
                    setYieldInputs({ ...yieldInputs, deposit: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">월 관리비/비용 (만원)</label>
                <Input
                  placeholder="예: 30"
                  value={yieldInputs.monthlyExpenses}
                  onChange={(e) =>
                    setYieldInputs({ ...yieldInputs, monthlyExpenses: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">현재 시세 (만원) - 선택</label>
                <Input
                  placeholder="예: 85000 (8.5억)"
                  value={yieldInputs.currentPrice}
                  onChange={(e) =>
                    setYieldInputs({ ...yieldInputs, currentPrice: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <Button className="w-full" onClick={handleCalculateYield} disabled={!yieldInputs.purchasePrice}>
                계산하기
              </Button>
            </div>
          </Card>

          {yieldResult && (
            <Card className="p-6 bg-green-50">
              <h3 className="font-semibold mb-4">수익률 분석 결과</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">연간 임대 수익</span>
                  <span className="font-medium">{formatPrice(yieldResult.annualRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">연간 비용</span>
                  <span className="font-medium text-red-500">-{formatPrice(yieldResult.annualExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">순 연간 수익</span>
                  <span className="font-medium">{formatPrice(yieldResult.netAnnualIncome)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-green-600">총 수익률</span>
                  <span className="font-bold text-green-600">{yieldResult.grossYield}%</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-green-600">순 수익률</span>
                  <span className="font-bold text-green-600">{yieldResult.netYield}%</span>
                </div>
                {yieldResult.capitalGain !== undefined && (
                  <>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-gray-600">시세 차익</span>
                      <span className={`font-medium ${yieldResult.capitalGain >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {yieldResult.capitalGain >= 0 ? '+' : ''}{formatPrice(yieldResult.capitalGain)}
                      </span>
                    </div>
                    {yieldResult.totalReturn !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 투자 수익률</span>
                        <span className={`font-bold ${yieldResult.totalReturn >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                          {yieldResult.totalReturn >= 0 ? '+' : ''}{yieldResult.totalReturn}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 대출 계산기 */}
      {activeTab === 'loan' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-purple-600" />
              대출 상환 계산
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">매물가 (만원)</label>
                <Input
                  placeholder="예: 80000 (8억)"
                  value={loanInputs.propertyPrice}
                  onChange={(e) =>
                    setLoanInputs({ ...loanInputs, propertyPrice: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">자기자본 (만원)</label>
                <Input
                  placeholder="예: 30000 (3억)"
                  value={loanInputs.downPayment}
                  onChange={(e) =>
                    setLoanInputs({ ...loanInputs, downPayment: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">금리 (%)</label>
                  <Input
                    value={loanInputs.interestRate}
                    onChange={(e) => setLoanInputs({ ...loanInputs, interestRate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">기간 (년)</label>
                  <Input
                    value={loanInputs.loanTermYears}
                    onChange={(e) => setLoanInputs({ ...loanInputs, loanTermYears: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">상환 방식</label>
                <div className="flex gap-2">
                  {[
                    { value: 'equalPayment', label: '원리금균등' },
                    { value: 'equalPrincipal', label: '원금균등' },
                    { value: 'bullet', label: '만기일시' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      size="sm"
                      variant={loanInputs.repaymentType === type.value ? 'default' : 'outline'}
                      onClick={() =>
                        setLoanInputs({
                          ...loanInputs,
                          repaymentType: type.value as 'equalPrincipal' | 'equalPayment' | 'bullet',
                        })
                      }
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleCalculateLoan} disabled={!loanInputs.propertyPrice}>
                계산하기
              </Button>
            </div>
          </Card>

          {loanResult && (
            <Card className="p-6 bg-purple-50">
              <h3 className="font-semibold mb-4">대출 상환 분석</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">대출금액</span>
                  <span className="font-medium">{formatPrice(loanResult.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LTV 비율</span>
                  <span className="font-medium">{loanResult.ltvRatio}%</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-purple-600">월 상환금</span>
                  <span className="font-bold text-purple-600">{formatPrice(loanResult.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 이자</span>
                  <span className="font-medium">{formatPrice(loanResult.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 상환금</span>
                  <span className="font-medium">{formatPrice(loanResult.totalRepayment)}</span>
                </div>

                {loanResult.schedule && loanResult.schedule.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setShowSchedule(!showSchedule)}
                    >
                      상환 스케줄 (첫 12개월)
                      {showSchedule ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                    {showSchedule && (
                      <div className="mt-2 text-xs">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="p-1 text-left">회차</th>
                              <th className="p-1 text-right">원금</th>
                              <th className="p-1 text-right">이자</th>
                              <th className="p-1 text-right">잔액</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loanResult.schedule.map((row) => (
                              <tr key={row.month} className="border-b">
                                <td className="p-1">{row.month}회</td>
                                <td className="p-1 text-right">{(row.principal / 10000).toFixed(0)}만</td>
                                <td className="p-1 text-right">{(row.interest / 10000).toFixed(0)}만</td>
                                <td className="p-1 text-right">{(row.balance / 100000000).toFixed(2)}억</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 중개수수료 계산기 */}
      {activeTab === 'commission' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Percent className="h-5 w-5 text-orange-600" />
              중개수수료 계산
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">거래 유형</label>
                <div className="flex gap-2">
                  {[
                    { value: 'sale', label: '매매' },
                    { value: 'lease', label: '전세' },
                    { value: 'monthly', label: '월세' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      size="sm"
                      variant={commissionInputs.transactionType === type.value ? 'default' : 'outline'}
                      onClick={() =>
                        setCommissionInputs({
                          ...commissionInputs,
                          transactionType: type.value as TransactionType,
                        })
                      }
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  {commissionInputs.transactionType === 'sale' ? '매매가' : '보증금'} (만원)
                </label>
                <Input
                  placeholder="예: 80000 (8억)"
                  value={commissionInputs.transactionAmount}
                  onChange={(e) =>
                    setCommissionInputs({
                      ...commissionInputs,
                      transactionAmount: e.target.value.replace(/[^0-9,]/g, ''),
                    })
                  }
                />
              </div>
              {commissionInputs.transactionType === 'monthly' && (
                <div>
                  <label className="text-sm text-gray-600 block mb-1">월세 (만원)</label>
                  <Input
                    placeholder="예: 100"
                    value={commissionInputs.monthlyRent}
                    onChange={(e) =>
                      setCommissionInputs({
                        ...commissionInputs,
                        monthlyRent: e.target.value.replace(/[^0-9,]/g, ''),
                      })
                    }
                  />
                </div>
              )}
              <Button
                className="w-full"
                onClick={handleCalculateCommission}
                disabled={!commissionInputs.transactionAmount}
              >
                계산하기
              </Button>
            </div>
          </Card>

          {commissionResult && (
            <Card className="p-6 bg-orange-50">
              <h3 className="font-semibold mb-4">수수료 계산 결과</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">거래금액</span>
                  <span className="font-medium">{formatPrice(commissionResult.transactionAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">적용 요율</span>
                  <span className="font-medium">{commissionResult.rate}%</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-orange-600">중개수수료</span>
                  <span className="font-bold text-orange-600">{formatPrice(commissionResult.totalFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">매수인 부담</span>
                  <span>{formatPrice(commissionResult.buyerFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">매도인 부담</span>
                  <span>{formatPrice(commissionResult.sellerFee)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">부가세 (10%)</span>
                  <span>{formatPrice(commissionResult.vatAmount || 0)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  * 법정 상한 요율 기준 계산. 실제 수수료는 협의에 따라 달라질 수 있습니다.
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 취득세 계산기 */}
      {activeTab === 'tax' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              취득세 계산
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">매물가 (만원)</label>
                <Input
                  placeholder="예: 80000 (8억)"
                  value={taxInputs.propertyPrice}
                  onChange={(e) =>
                    setTaxInputs({ ...taxInputs, propertyPrice: e.target.value.replace(/[^0-9,]/g, '') })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">매물 유형</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'apartment', label: '아파트' },
                    { value: 'villa', label: '빌라' },
                    { value: 'house', label: '단독주택' },
                    { value: 'officetel', label: '오피스텔' },
                    { value: 'commercial', label: '상가' },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      size="sm"
                      variant={taxInputs.propertyType === type.value ? 'default' : 'outline'}
                      onClick={() =>
                        setTaxInputs({ ...taxInputs, propertyType: type.value as PropertyType })
                      }
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-600">1주택자 여부</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={taxInputs.isFirstHome ? 'default' : 'outline'}
                    onClick={() => setTaxInputs({ ...taxInputs, isFirstHome: true })}
                  >
                    예
                  </Button>
                  <Button
                    size="sm"
                    variant={!taxInputs.isFirstHome ? 'default' : 'outline'}
                    onClick={() => setTaxInputs({ ...taxInputs, isFirstHome: false })}
                  >
                    아니오
                  </Button>
                </div>
              </div>
              {!taxInputs.isFirstHome && (
                <div>
                  <label className="text-sm text-gray-600 block mb-1">현재 보유 주택 수</label>
                  <Input
                    type="number"
                    value={taxInputs.numberOfHomes}
                    onChange={(e) => setTaxInputs({ ...taxInputs, numberOfHomes: e.target.value })}
                  />
                </div>
              )}
              <Button className="w-full" onClick={handleCalculateTax} disabled={!taxInputs.propertyPrice}>
                계산하기
              </Button>
            </div>
          </Card>

          {taxResult && (
            <Card className="p-6 bg-red-50">
              <h3 className="font-semibold mb-4">취득세 계산 결과</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">매물가</span>
                  <span className="font-medium">{formatPrice(taxResult.propertyPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">적용 세율</span>
                  <span className="font-medium">{taxResult.acquisitionTaxRate}%</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-600">취득세</span>
                  <span className="font-medium">{formatPrice(taxResult.acquisitionTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">지방교육세</span>
                  <span className="font-medium">{formatPrice(taxResult.educationTax)}</span>
                </div>
                {taxResult.specialTax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">농어촌특별세</span>
                    <span className="font-medium">{formatPrice(taxResult.specialTax)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-red-600">총 세금</span>
                  <span className="font-bold text-red-600">{formatPrice(taxResult.totalTax)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  * 2024년 기준 간소화된 세율로 계산. 실제 세금은 조정지역 여부, 취득 시기 등에 따라 달라질 수 있습니다.
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/calculator',
    component: CalculatorPage,
    getParentRoute: () => parentRoute,
  })
