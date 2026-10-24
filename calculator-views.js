import { adRoas, affiliateCommission, annualPricing, lifetimeVsSubscription, mrrGoal, aiApiCost, emailListGrowth, outsourceVsDiy, refundChargeback, sponsorshipCpm, pricingProfit, projectQuote, revenueGoal, churnStats, conversionRate, discountImpact, freelanceRate, hourlyToSalary, ltvCac, mrrProjection, netRevenueRetention, priceIncrease, referralLoop, runway, taxReserve } from './calculations.js?v=202610241';
import { escapeHtml, field, resultRow } from './calculator-ui.js?v=202610241';
export function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
export function formatters(locale, currency, maximumFractionDigits = 2) {
    const tag = locale === "en" ? "en-US" : locale === "zh-TW" ? "zh-TW" : "zh-CN";
    const money = new Intl.NumberFormat(tag, {
        style: "currency",
        currency,
        currencyDisplay: "symbol",
        maximumFractionDigits,
    });
    const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
    const ratio = new Intl.NumberFormat(tag, { maximumFractionDigits: 2 });
    const percent = (value) => `${number.format(value)}%`;
    return { money: (value) => money.format(value), number: (value) => number.format(value), ratio: (value) => ratio.format(value), percent };
}
export function withCurrencyLabels(text, currency) {
    const name = text.currency.names[currency];
    const labels = Object.fromEntries(Object.entries(text.labels).map(([key, label]) => [key, label.replace("{currency}", name)]));
    return { ...text, labels };
}
export function ProfitCalculator({ locale, text, currency, values }) {
    const price = values.price ?? "29";
    const customers = values.customers ?? "100";
    const feePercent = values.feePercent ?? "2.9";
    const feeFixed = values.feeFixed ?? "0.3";
    const costs = values.costs ?? "500";
    const variableCost = values.variableCost ?? "0";
    const targetNet = values.targetNet ?? "25";
    const format = formatters(locale, currency);
    const { profit, fees, threshold } = pricingProfit({
        price: toNumber(price), customers: toNumber(customers),
        feePercent: Math.min(100, toNumber(feePercent)), feeFixed: toNumber(feeFixed),
        costs: toNumber(costs), variableCost: toNumber(variableCost), targetNet: toNumber(targetNet),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "customers", label: text.labels.customers, value: customers, step: "1", name: "customers" })}
      ${field({ id: "fee-percent", label: text.labels.feePercent, value: feePercent, max: 100, name: "feePercent" })}
      ${field({ id: "fee-fixed", label: text.labels.feeFixed, value: feeFixed, name: "feeFixed" })}
      ${field({ id: "costs", label: text.labels.costs, value: costs, name: "costs" })}
      ${field({ id: "variable-cost", label: text.labels.variableCost, value: variableCost, name: "variableCost" })}
      ${field({ id: "target-net", label: text.labels.targetNet, value: targetNet, name: "targetNet" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.revenue, value: format.money(profit.revenue) })}
      ${resultRow({ label: text.results.fees, value: format.money(profit.fees) })}
      ${resultRow({ label: text.results.netRevenue, value: format.money(profit.netRevenue) })}
      ${resultRow({ id: "profit", label: text.results.profit, value: format.money(profit.profit), strong: true })}
      ${resultRow({ label: text.results.margin, value: format.percent(profit.margin) })}
      ${resultRow({ id: "fees", label: text.results.netReceived, value: format.money(fees.net) })}
      ${resultRow({ label: text.results.effectiveRate, value: format.percent(fees.effectiveRate) })}
      ${resultRow({ label: text.results.priceForTarget, value: fees.priceForTarget === null ? text.results.notAvailable : format.money(fees.priceForTarget) })}
      ${resultRow({ label: text.results.contribution, value: format.money(threshold.contribution) })}
      ${resultRow({ id: "break-even", label: text.results.units, value: threshold.units === null ? text.results.notAvailable : format.number(threshold.units), strong: true })}
      ${resultRow({ label: text.results.revenueNeeded, value: threshold.revenue === null ? text.results.notAvailable : format.money(threshold.revenue) })}
      ${resultRow({ label: text.results.contributionMargin, value: format.percent(threshold.contributionMargin) })} </dl>
${(threshold.units === null && `<p class="tool-warning" role="status">${escapeHtml(text.results.unreachable)}</p>` || "")}` };
}
export function MrrCalculator({ locale, text, currency, values }) {
    const price = values.price ?? "19";
    const customers = values.customers ?? "200";
    const growth = values.growth ?? "8";
    const churn = values.churn ?? "3";
    const months = values.months ?? "12";
    const format = formatters(locale, currency);
    const result = mrrProjection({
        price: toNumber(price),
        customers: toNumber(customers),
        growthPercent: toNumber(growth),
        churnPercent: toNumber(churn),
        months: toNumber(months),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "customers", label: text.labels.customers, value: customers, step: "1", name: "customers" })}
      ${field({ id: "growth", label: text.labels.growth, value: growth, name: "growth" })}
      ${field({ id: "churn", label: text.labels.churn, value: churn, name: "churn" })}
      ${field({ id: "months", label: text.labels.months, value: months, step: "1", name: "months" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.mrr, value: format.money(result.mrr), strong: true })}
      ${resultRow({ label: text.results.arr, value: format.money(result.arr) })}
      ${resultRow({ label: text.results.projectedCustomers, value: format.number(result.projectedCustomers) })}
      ${resultRow({ label: text.results.projectedMrr, value: format.money(result.projectedMrr) })}
      ${resultRow({ label: text.results.projectedArr, value: format.money(result.projectedArr) })} </dl>
<div class="tool-table-wrap"> <table class="tool-table"> <thead><tr><th scope="col">${escapeHtml(text.results.month)}</th><th scope="col">${escapeHtml(text.results.customersColumn)}</th><th scope="col">${escapeHtml(text.results.mrrColumn)}</th></tr></thead> <tbody>${(result.points.map(point => `<tr><td>${escapeHtml(point.month)}</td><td>${escapeHtml(format.number(point.customers))}</td><td>${escapeHtml(format.money(point.mrr))}</td></tr>`)).join("")}</tbody> </table> </div>` };
}
export function LtvCacCalculator({ locale, text, currency, values }) {
    const arpu = values.arpu ?? "29";
    const margin = values.margin ?? "85";
    const churn = values.churn ?? "4";
    const cac = values.cac ?? "120";
    const format = formatters(locale, currency);
    const result = ltvCac({
        arpu: toNumber(arpu),
        marginPercent: toNumber(margin),
        churnPercent: toNumber(churn),
        cac: toNumber(cac),
    });
    const months = (value) => value === null
        ? text.results.notAvailable
        : `${format.number(value)} ${text.results.monthsUnit}`;
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "arpu", label: text.labels.arpu, value: arpu, name: "arpu" })}
      ${field({ id: "margin", label: text.labels.marginPercent, value: margin, name: "margin" })}
      ${field({ id: "churn", label: text.labels.churn, value: churn, name: "churn" })}
      ${field({ id: "cac", label: text.labels.cac, value: cac, name: "cac" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.monthlyProfit, value: format.money(result.monthlyProfit) })}
      ${resultRow({ label: text.results.lifetimeMonths, value: months(result.lifetimeMonths) })}
      ${resultRow({ label: text.results.ltv, value: result.ltv === null ? text.results.notAvailable : format.money(result.ltv) })}
      ${resultRow({ label: text.results.ratio, value: result.ratio === null ? text.results.notAvailable : `${format.number(result.ratio)} : 1`, strong: true })}
      ${resultRow({ label: text.results.payback, value: months(result.paybackMonths) })} </dl>` };
}
export function ChurnCalculator({ locale, text, currency, values }) {
    const start = values.start ?? "500";
    const lost = values.lost ?? "20";
    const format = formatters(locale, currency);
    const result = churnStats({ startCustomers: toNumber(start), lostCustomers: toNumber(lost) });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "start-customers", label: text.labels.startCustomers, value: start, step: "1", name: "start" })}
      ${field({ id: "lost-customers", label: text.labels.lostCustomers, value: lost, step: "1", name: "lost" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.churnRate, value: format.percent(result.rate), strong: true })}
      ${resultRow({ label: text.results.retention, value: format.percent(result.retention) })}
      ${resultRow({ label: text.results.annualChurn, value: format.percent(result.annualChurn) })}
      ${resultRow({ label: text.results.lifetimeMonths, value: result.lifetimeMonths === null ? text.results.notAvailable : `${format.number(result.lifetimeMonths)} ${text.results.monthsUnit}` })} </dl>` };
}
export function AnnualPricingCalculator({ locale, text, currency, values }) {
    const monthly = values.monthly ?? "20";
    const discount = values.discount ?? "20";
    const format = formatters(locale, currency);
    const result = annualPricing({ monthlyPrice: toNumber(monthly), discountPercent: toNumber(discount) });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "monthly-price", label: text.labels.monthlyPrice, value: monthly, name: "monthly" })}
      ${field({ id: "discount", label: text.labels.discountPercent, value: discount, max: 100, name: "discount" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.fullYear, value: format.money(result.fullYear) })}
      ${resultRow({ label: text.results.annualPrice, value: format.money(result.annualPrice), strong: true })}
      ${resultRow({ label: text.results.monthlyEquivalent, value: format.money(result.monthlyEquivalent) })}
      ${resultRow({ label: text.results.savings, value: format.money(result.savings) })}
      ${resultRow({ label: text.results.freeMonths, value: `${format.number(result.freeMonths)} ${text.results.monthsUnit}` })} </dl>` };
}
export function FreelanceRateCalculator({ locale, text, currency, values }) {
    const income = values.income ?? "60000";
    const expenses = values.expenses ?? "6000";
    const hours = values.hours ?? "25";
    const weeksOff = values.weeksOff ?? "6";
    const tax = values.tax ?? "25";
    const format = formatters(locale, currency);
    const result = freelanceRate({
        targetIncome: toNumber(income),
        expenses: toNumber(expenses),
        hoursPerWeek: toNumber(hours),
        weeksOff: toNumber(weeksOff),
        taxPercent: toNumber(tax),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "target-income", label: text.labels.targetIncome, value: income, name: "income" })}
      ${field({ id: "expenses", label: text.labels.expenses, value: expenses, name: "expenses" })}
      ${field({ id: "hours-per-week", label: text.labels.hoursPerWeek, value: hours, name: "hours" })}
      ${field({ id: "weeks-off", label: text.labels.weeksOff, value: weeksOff, step: "1", name: "weeksOff" })}
      ${field({ id: "tax", label: text.labels.taxPercent, value: tax, name: "tax" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.requiredRevenue, value: format.money(result.requiredRevenue) })}
      ${resultRow({ label: text.results.billableHours, value: format.number(result.billableHours) })}
      ${resultRow({ label: text.results.hourlyRate, value: result.hourlyRate === null ? text.results.notAvailable : format.money(result.hourlyRate), strong: true })} </dl>` };
}
export function RunwayCalculator({ locale, text, currency, values }) {
    const cash = values.cash ?? "50000";
    const monthlyExpenses = values.monthlyExpenses ?? "4000";
    const monthlyRevenue = values.monthlyRevenue ?? "1500";
    const format = formatters(locale, currency);
    const result = runway({
        cash: toNumber(cash),
        monthlyExpenses: toNumber(monthlyExpenses),
        monthlyRevenue: toNumber(monthlyRevenue),
    });
    const months = result.months === null
        ? text.results.notAvailable
        : `${format.number(result.months)} ${text.results.monthsUnit}`;
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "cash", label: text.labels.cash, value: cash, name: "cash" })}
      ${field({ id: "monthly-expenses", label: text.labels.monthlyExpenses, value: monthlyExpenses, name: "monthlyExpenses" })}
      ${field({ id: "monthly-revenue", label: text.labels.monthlyRevenue, value: monthlyRevenue, name: "monthlyRevenue" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.netBurn, value: format.money(result.netBurn), strong: true })}
      ${resultRow({ label: text.results.runwayMonths, value: months })} </dl>
<p class="${escapeHtml(result.months === null || result.shortRunway ? "tool-warning" : "tool-note")}" role="status"> ${escapeHtml(result.months === null ? text.results.runwayNoBurn : result.shortRunway ? text.results.runwayShort : text.results.runwayHealthy)} </p>` };
}
export function TaxReserveCalculator({ locale, text, currency, values }) {
    const annualRevenue = values.annualRevenue ?? "80000";
    const annualExpenses = values.annualExpenses ?? "15000";
    const tax = values.tax ?? "25";
    const format = formatters(locale, currency);
    const result = taxReserve({
        annualRevenue: toNumber(annualRevenue),
        annualExpenses: toNumber(annualExpenses),
        taxPercent: toNumber(tax),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "annual-revenue", label: text.labels.annualRevenue, value: annualRevenue, name: "annualRevenue" })}
      ${field({ id: "annual-expenses", label: text.labels.annualExpenses, value: annualExpenses, name: "annualExpenses" })}
      ${field({ id: "tax-rate", label: text.labels.taxPercent, value: tax, name: "tax" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.taxableProfit, value: format.money(result.taxableProfit) })}
      ${resultRow({ label: text.results.taxReserve, value: format.money(result.reserve), strong: true })}
      ${resultRow({ label: text.results.monthlySetAside, value: format.money(result.monthlySetAside) })}
      ${resultRow({ label: text.results.afterTax, value: format.money(result.afterTax) })} </dl>` };
}
export function DiscountImpactCalculator({ locale, text, currency, values }) {
    const price = values.price ?? "49";
    const discount = values.discount ?? "20";
    const margin = values.margin ?? "80";
    const format = formatters(locale, currency);
    const result = discountImpact({
        price: toNumber(price),
        discountPercent: toNumber(discount),
        marginPercent: toNumber(margin),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "discount", label: text.labels.promotionDiscount, value: discount, max: 100, name: "discount" })}
      ${field({ id: "margin", label: text.labels.marginPercent, value: margin, name: "margin" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.discountedPrice, value: format.money(result.discountedPrice) })}
      ${resultRow({ label: text.results.unitCost, value: format.money(result.unitCost) })}
      ${resultRow({ label: text.results.profitBefore, value: format.money(result.profitBefore) })}
      ${resultRow({ label: text.results.profitAfter, value: format.money(result.profitAfter), strong: true })}
      ${resultRow({ label: text.results.marginAfter, value: format.percent(result.marginAfter) })}
      ${resultRow({ label: text.results.volumeMultiplier, value: result.volumeMultiplier === null ? text.results.notAvailable : `${format.number(result.volumeMultiplier)}×` })} </dl>
${(result.volumeMultiplier === null && `<p class="tool-warning" role="alert">${escapeHtml(text.results.discountLoss)}</p>` || "")}` };
}
export function HourlyToSalaryCalculator({ locale, text, currency, values }) {
    const hourly = values.hourly ?? "60";
    const hours = values.hours ?? "25";
    const weeks = values.weeks ?? "48";
    const format = formatters(locale, currency);
    const result = hourlyToSalary({
        hourlyRate: toNumber(hourly),
        hoursPerWeek: toNumber(hours),
        weeksPerYear: toNumber(weeks),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "hourly-rate", label: text.labels.hourlyRate, value: hourly, name: "hourly" })}
      ${field({ id: "hours-per-week", label: text.labels.hoursPerWeek, value: hours, name: "hours" })}
      ${field({ id: "weeks-per-year", label: text.labels.weeksPerYear, value: weeks, step: "1", name: "weeks" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.annualSalary, value: format.money(result.annual), strong: true })}
      ${resultRow({ label: text.results.monthlySalary, value: format.money(result.monthly) })}
      ${resultRow({ label: text.results.weeklySalary, value: format.money(result.weekly) })} </dl>` };
}
export function ReferralLoopCalculator({ locale, text, currency, values }) {
    const invites = values.invites ?? "2";
    const conversion = values.conversion ?? "25";
    const format = formatters(locale, currency);
    const result = referralLoop({
        invitesPerUser: toNumber(invites),
        conversionPercent: toNumber(conversion),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "invites-per-user", label: text.labels.invitesPerUser, value: invites, name: "invites" })}
      ${field({ id: "conversion", label: text.labels.conversionPercent, value: conversion, name: "conversion" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.viralCoefficient, value: format.number(result.viralCoefficient), strong: true })}
      ${resultRow({ label: text.results.amplification, value: result.amplification === null ? text.results.selfSustaining : `${format.number(result.amplification)}×` })} </dl>
<p class="tool-note" role="status">${escapeHtml(text.results.loopNote)}</p>` };
}
export function PriceIncreaseCalculator({ locale, text, currency, values }) {
    const price = values.price ?? "10";
    const newPrice = values.newPrice ?? "12";
    const customers = values.customers ?? "1000";
    const format = formatters(locale, currency);
    const result = priceIncrease({
        price: toNumber(price),
        newPrice: toNumber(newPrice),
        customers: toNumber(customers),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "new-price", label: text.labels.newPrice, value: newPrice, name: "newPrice" })}
      ${field({ id: "customers", label: text.labels.customers, value: customers, name: "customers" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.currentRevenue, value: format.money(result.currentRevenue) })}
      ${resultRow({ label: text.results.newRevenue, value: format.money(result.newRevenue), strong: true })}
      ${resultRow({ label: text.results.revenueDifference, value: format.money(result.difference) })}
      ${resultRow({ label: text.results.priceIncreasePercent, value: format.percent(result.percent) })}
      ${resultRow({ label: text.results.tolerableLoss, value: format.number(Math.round(result.tolerableLoss)) })}
      ${resultRow({ label: text.results.tolerableLossPercent, value: format.percent(result.tolerableLossPercent) })} </dl>` };
}
export function ConversionRateCalculator({ locale, text, currency, values }) {
    const visitors = values.visitors ?? "10000";
    const conversions = values.conversions ?? "250";
    const format = formatters(locale, currency);
    const result = conversionRate({
        visitors: toNumber(visitors),
        conversions: toNumber(conversions),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "visitors", label: text.labels.visitors, value: visitors, name: "visitors" })}
      ${field({ id: "conversions", label: text.labels.conversions, value: conversions, name: "conversions" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.conversionRate, value: format.percent(result.rate), strong: true })}
      ${resultRow({ label: text.results.visitorsPerConversion, value: result.visitorsPerConversion === null ? text.results.notAvailable : format.number(result.visitorsPerConversion) })} </dl>` };
}
export function NrrCalculator({ locale, text, currency, values }) {
    const startMrr = values.startMrr ?? "10000";
    const expansionMrr = values.expansionMrr ?? "800";
    const contractionMrr = values.contractionMrr ?? "300";
    const churnedMrr = values.churnedMrr ?? "500";
    const format = formatters(locale, currency);
    const result = netRevenueRetention({
        startMrr: toNumber(startMrr),
        expansionMrr: toNumber(expansionMrr),
        contractionMrr: toNumber(contractionMrr),
        churnedMrr: toNumber(churnedMrr),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "start-mrr", label: text.labels.startMrr, value: startMrr, name: "startMrr" })}
      ${field({ id: "expansion-mrr", label: text.labels.expansionMrr, value: expansionMrr, name: "expansionMrr" })}
      ${field({ id: "contraction-mrr", label: text.labels.contractionMrr, value: contractionMrr, name: "contractionMrr" })}
      ${field({ id: "churned-mrr", label: text.labels.churnedMrr, value: churnedMrr, name: "churnedMrr" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.nrr, value: format.percent(result.nrr), strong: true })}
      ${resultRow({ label: text.results.grr, value: format.percent(result.grr) })}
      ${resultRow({ label: text.results.endingMrr, value: format.money(result.endingMrr) })}
      ${resultRow({ label: text.results.netMrrChange, value: format.money(result.netChange) })} </dl>
<p class="tool-note" role="status">${escapeHtml(text.results.nrrNote)}</p>` };
}
export function AdRoasCalculator({ locale, text, currency, values }) {
    const budget = values.budget ?? "1000";
    const cpc = values.cpc ?? "0.8";
    const conversion = values.conversion ?? "3";
    const price = values.price ?? "49";
    const margin = values.margin ?? "80";
    const format = formatters(locale, currency);
    const result = adRoas({
        budget: toNumber(budget), cpc: toNumber(cpc), conversionPercent: toNumber(conversion),
        price: toNumber(price), marginPercent: toNumber(margin),
    });
    const multiple = (value) => value === null ? text.results.notAvailable : `${format.ratio(value)}×`;
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "ad-budget", label: text.labels.adBudget, value: budget, name: "budget" })}
      ${field({ id: "cpc", label: text.labels.cpc, value: cpc, name: "cpc" })}
      ${field({ id: "click-conversion", label: text.labels.clickConversion, value: conversion, max: 100, name: "conversion" })}
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "margin", label: text.labels.marginPercent, value: margin, max: 100, name: "margin" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.clicks, value: format.number(result.clicks) })}
      ${resultRow({ label: text.results.adCustomers, value: format.number(result.customers) })}
      ${resultRow({ label: text.results.adRevenue, value: format.money(result.revenue) })}
      ${resultRow({ label: text.results.cpa, value: result.cpa === null ? text.results.notAvailable : format.money(result.cpa) })}
      ${resultRow({ label: text.results.roas, value: multiple(result.roas), strong: true })}
      ${resultRow({ label: text.results.breakEvenRoas, value: multiple(result.breakEvenRoas) })}
      ${resultRow({ label: text.results.adProfit, value: format.money(result.profit), strong: true })} </dl>
<p class="tool-note" role="status">${escapeHtml(text.results.roasNote)}</p>` };
}
export function RefundChargebackCalculator({ locale, text, currency, values }) {
    const revenue = values.revenue ?? "10000";
    const orders = values.orders ?? "400";
    const refund = values.refund ?? "3";
    const chargeback = values.chargeback ?? "0.5";
    const fee = values.fee ?? "15";
    const format = formatters(locale, currency);
    const result = refundChargeback({
        revenue: toNumber(revenue), orders: toNumber(orders), refundPercent: toNumber(refund),
        chargebackPercent: toNumber(chargeback), chargebackFee: toNumber(fee),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "gross-revenue", label: text.labels.grossRevenue, value: revenue, name: "revenue" })}
      ${field({ id: "orders", label: text.labels.orders, value: orders, step: "1", name: "orders" })}
      ${field({ id: "refund-rate", label: text.labels.refundPercent, value: refund, max: 100, name: "refund" })}
      ${field({ id: "chargeback-rate", label: text.labels.chargebackPercent, value: chargeback, max: 100, name: "chargeback" })}
      ${field({ id: "chargeback-fee", label: text.labels.chargebackFee, value: fee, name: "fee" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.refunds, value: format.money(result.refunds) })}
      ${resultRow({ label: text.results.chargebacks, value: format.money(result.chargebacks) })}
      ${resultRow({ label: text.results.chargebackCount, value: format.number(result.chargebackCount) })}
      ${resultRow({ label: text.results.chargebackPenalties, value: format.money(result.penalties) })}
      ${resultRow({ label: text.results.totalLoss, value: format.money(result.totalLoss) })}
      ${resultRow({ label: text.results.revenueKept, value: format.money(result.netRevenue), strong: true })}
      ${resultRow({ label: text.results.lossPercent, value: format.percent(result.lossPercent) })} </dl>
${(result.highChargebacks && `<p class="tool-warning" role="status">${escapeHtml(text.results.chargebackWarning)}</p>` || "")}
<p class="tool-note">${escapeHtml(text.results.chargebackNote)}</p>` };
}
export function SponsorshipCpmCalculator({ locale, text, currency, values }) {
    const subscribers = values.subscribers ?? "5000";
    const open = values.open ?? "45";
    const cpm = values.cpm ?? "40";
    const issues = values.issues ?? "4";
    const fill = values.fill ?? "50";
    const format = formatters(locale, currency);
    const result = sponsorshipCpm({
        subscribers: toNumber(subscribers), openPercent: toNumber(open), cpm: toNumber(cpm),
        issuesPerMonth: toNumber(issues), fillPercent: toNumber(fill),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "subscribers", label: text.labels.subscribers, value: subscribers, step: "1", name: "subscribers" })}
      ${field({ id: "open-rate", label: text.labels.openPercent, value: open, max: 100, name: "open" })}
      ${field({ id: "cpm", label: text.labels.cpm, value: cpm, name: "cpm" })}
      ${field({ id: "issues", label: text.labels.issuesPerMonth, value: issues, step: "1", name: "issues" })}
      ${field({ id: "fill-rate", label: text.labels.fillPercent, value: fill, max: 100, name: "fill" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.impressions, value: format.number(result.impressions) })}
      ${resultRow({ label: text.results.perIssue, value: format.money(result.perIssue), strong: true })}
      ${resultRow({ label: text.results.sponsorMonthly, value: format.money(result.monthly) })}
      ${resultRow({ label: text.results.sponsorAnnual, value: format.money(result.annual) })} </dl>
<p class="tool-note">${escapeHtml(text.results.sponsorNote)}</p>` };
}
export function EmailListGrowthCalculator({ locale, text, currency, values }) {
    const start = values.start ?? "1000";
    const added = values.added ?? "200";
    const unsubscribe = values.unsubscribe ?? "2";
    const months = values.months ?? "12";
    const target = values.target ?? "5000";
    const format = formatters(locale, currency);
    const result = emailListGrowth({
        startSubscribers: toNumber(start), newPerMonth: toNumber(added), unsubscribePercent: toNumber(unsubscribe),
        months: toNumber(months), target: toNumber(target),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "list-size", label: text.labels.listSize, value: start, step: "1", name: "start" })}
      ${field({ id: "new-subscribers", label: text.labels.newSubscribers, value: added, step: "1", name: "added" })}
      ${field({ id: "unsubscribe-rate", label: text.labels.unsubscribePercent, value: unsubscribe, max: 100, name: "unsubscribe" })}
      ${field({ id: "months", label: text.labels.months, value: months, step: "1", name: "months" })}
      ${field({ id: "target-subscribers", label: text.labels.targetSubscribers, value: target, step: "1", name: "target" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.projectedSubscribers, value: format.number(Math.round(result.projected)), strong: true })}
      ${resultRow({ label: text.results.netAdded, value: format.number(Math.round(result.netAdded)) })}
      ${resultRow({ label: text.results.listCeiling, value: result.ceiling === null ? text.results.notAvailable : format.number(Math.round(result.ceiling)) })}
      ${resultRow({ label: text.results.monthsToTarget, value: result.monthsToTarget === null ? text.results.notAvailable : `${format.number(result.monthsToTarget)} ${text.results.monthsUnit}` })} </dl>
<p class="tool-note" role="status">${escapeHtml(text.results.listNote)}</p>` };
}
export function OutsourceCalculator({ locale, text, currency, values }) {
    const hours = values.hours ?? "20";
    const value = values.value ?? "50";
    const quote = values.quote ?? "600";
    const management = values.management ?? "3";
    const format = formatters(locale, currency);
    const result = outsourceVsDiy({
        hours: toNumber(hours), hourlyValue: toNumber(value), quote: toNumber(quote), managementHours: toNumber(management),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "task-hours", label: text.labels.taskHours, value: hours, name: "hours" })}
      ${field({ id: "hourly-value", label: text.labels.hourlyValue, value: value, name: "value" })}
      ${field({ id: "outsource-quote", label: text.labels.outsourceQuote, value: quote, name: "quote" })}
      ${field({ id: "management-hours", label: text.labels.managementHours, value: management, name: "management" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.diyCost, value: format.money(result.diyCost) })}
      ${resultRow({ label: text.results.outsourceCost, value: format.money(result.outsourceCost) })}
      ${resultRow({ label: text.results.outsourceSavings, value: format.money(result.savings), strong: true })}
      ${resultRow({ label: text.results.freedHours, value: format.number(result.freedHours) })}
      ${resultRow({ label: text.results.breakEvenValue, value: result.breakEvenValue === null ? text.results.notAvailable : format.money(result.breakEvenValue) })} </dl>
<p class="${escapeHtml(result.savings > 0 ? "tool-note" : "tool-warning")}" role="status"> ${escapeHtml(result.savings > 0 ? text.results.outsourceBetter : text.results.diyBetter)} </p>` };
}
export function LifetimeDealCalculator({ locale, text, currency, values }) {
    const lifetimePrice = values.lifetimePrice ?? "199";
    const monthlyPrice = values.monthlyPrice ?? "19";
    const churn = values.churn ?? "5";
    const serviceCost = values.serviceCost ?? "2";
    const format = formatters(locale, currency);
    const result = lifetimeVsSubscription({
        lifetimePrice: toNumber(lifetimePrice), monthlyPrice: toNumber(monthlyPrice),
        churnPercent: toNumber(churn), serviceCost: toNumber(serviceCost),
    });
    const months = (value) => value === null ? text.results.notAvailable : `${format.number(value)} ${text.results.monthsUnit}`;
    const money = (value) => value === null ? text.results.notAvailable : format.money(value);
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "lifetime-price", label: text.labels.lifetimePrice, value: lifetimePrice, name: "lifetimePrice" })}
      ${field({ id: "monthly-price", label: text.labels.monthlyPrice, value: monthlyPrice, name: "monthlyPrice" })}
      ${field({ id: "churn", label: text.labels.churn, value: churn, max: 100, name: "churn" })}
      ${field({ id: "service-cost", label: text.labels.serviceCost, value: serviceCost, name: "serviceCost" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.equivalentMonths, value: months(result.equivalentMonths) })}
      ${resultRow({ label: text.results.lifetimeMonths, value: months(result.lifetimeMonths) })}
      ${resultRow({ label: text.results.subscriptionProfit, value: money(result.subscriptionProfit) })}
      ${resultRow({ label: text.results.lifetimeProfit, value: money(result.lifetimeProfit) })}
      ${resultRow({ label: text.results.lifetimeGap, value: money(result.gap), strong: true })} </dl>
<p class="${escapeHtml(result.gap === null ? "tool-warning" : "tool-note")}" role="status"> ${escapeHtml(result.gap === null ? text.results.lifetimeNoChurn : result.gap >= 0 ? text.results.subscriptionBetter : text.results.lifetimeBetter)} </p>
<p class="tool-note">${escapeHtml(text.results.lifetimeNote)}</p>` };
}
export function AffiliateCommissionCalculator({ locale, text, currency, values }) {
    const price = values.price ?? "49";
    const margin = values.margin ?? "80";
    const commission = values.commission ?? "30";
    const sales = values.sales ?? "20";
    const format = formatters(locale, currency);
    const result = affiliateCommission({
        price: toNumber(price), marginPercent: toNumber(margin),
        commissionPercent: toNumber(commission), sales: toNumber(sales),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "margin", label: text.labels.marginPercent, value: margin, max: 100, name: "margin" })}
      ${field({ id: "commission", label: text.labels.commissionPercent, value: commission, max: 100, name: "commission" })}
      ${field({ id: "affiliate-sales", label: text.labels.affiliateSales, value: sales, step: "1", name: "sales" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.commission, value: format.money(result.commission) })}
      ${resultRow({ label: text.results.profitAfterCommission, value: format.money(result.profit), strong: true })}
      ${resultRow({ label: text.results.marginAfterCommission, value: format.percent(result.marginAfter) })}
      ${resultRow({ label: text.results.maxCommission, value: format.percent(result.maxCommissionPercent) })}
      ${resultRow({ label: text.results.monthlyCommission, value: format.money(result.monthlyCommission) })}
      ${resultRow({ label: text.results.monthlyProfitAfterCommission, value: format.money(result.monthlyProfit) })} </dl>
${(result.profit < 0 && `<p class="tool-warning" role="status">${escapeHtml(text.results.commissionLoss)}</p>` || "")}` };
}
export function MrrGoalCalculator({ locale, text, currency, values }) {
    const current = values.current ?? "2000";
    const added = values.added ?? "500";
    const churn = values.churn ?? "3";
    const months = values.months ?? "12";
    const target = values.target ?? "10000";
    const format = formatters(locale, currency);
    const result = mrrGoal({
        currentMrr: toNumber(current), newMrr: toNumber(added), churnPercent: toNumber(churn),
        months: toNumber(months), targetMrr: toNumber(target),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "current-mrr", label: text.labels.currentMrr, value: current, name: "current" })}
      ${field({ id: "new-mrr", label: text.labels.newMrr, value: added, name: "added" })}
      ${field({ id: "mrr-churn", label: text.labels.mrrChurn, value: churn, max: 100, name: "churn" })}
      ${field({ id: "months", label: text.labels.months, value: months, step: "1", name: "months" })}
      ${field({ id: "target-mrr", label: text.labels.targetMrr, value: target, name: "target" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.monthsToTarget, value: result.monthsToTarget === null ? text.results.notAvailable : `${format.number(result.monthsToTarget)} ${text.results.monthsUnit}`, strong: true })}
      ${resultRow({ label: text.results.projectedMrr, value: format.money(result.projected) })}
      ${resultRow({ label: text.results.mrrCeiling, value: result.ceiling === null ? text.results.notAvailable : format.money(result.ceiling) })} </dl>
<p class="tool-note" role="status">${escapeHtml(text.results.mrrGoalNote)}</p>` };
}
export function ProjectQuoteCalculator({ locale, text, currency, values }) {
    const hours = values.hours ?? "40";
    const rate = values.rate ?? "50";
    const extra = values.extra ?? "200";
    const reserve = values.reserve ?? "15";
    const format = formatters(locale, currency);
    const result = projectQuote({ hours: toNumber(hours), hourlyRate: toNumber(rate), extraCosts: toNumber(extra), reservePercent: toNumber(reserve) });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "project-hours", label: text.labels.projectHours, value: hours, name: "hours" })}
      ${field({ id: "project-rate", label: text.labels.hourlyRate, value: rate, name: "rate" })}
      ${field({ id: "project-extra", label: text.labels.extraCosts, value: extra, name: "extra" })}
      ${field({ id: "project-reserve", label: text.labels.reservePercent, value: reserve, name: "reserve" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.baseCost, value: format.money(result.base) })}
      ${resultRow({ label: text.results.reserve, value: format.money(result.reserve) })}
      ${resultRow({ label: text.results.quote, value: format.money(result.quote), strong: true })} </dl>
<p class="tool-note">${escapeHtml(text.workflow.quoteNote)}</p>` };
}
export function AiApiCostCalculator({ locale, text, currency, values }) {
    const inputTokens = values.inputTokens ?? "1000";
    const outputTokens = values.outputTokens ?? "500";
    const inputPrice = values.inputPrice ?? "1";
    const outputPrice = values.outputPrice ?? "4";
    const calls = values.calls ?? "10000";
    const users = values.users ?? "100";
    const format = formatters(locale, currency);
    const precise = formatters(locale, currency, 6);
    const result = aiApiCost({
        inputTokens: toNumber(inputTokens), outputTokens: toNumber(outputTokens),
        inputPrice: toNumber(inputPrice), outputPrice: toNumber(outputPrice),
        calls: toNumber(calls), users: toNumber(users),
    });
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "input-tokens", label: text.labels.inputTokens, value: inputTokens, step: "1", name: "inputTokens" })}
      ${field({ id: "output-tokens", label: text.labels.outputTokens, value: outputTokens, step: "1", name: "outputTokens" })}
      ${field({ id: "input-price", label: text.labels.inputPrice, value: inputPrice, name: "inputPrice" })}
      ${field({ id: "output-price", label: text.labels.outputPrice, value: outputPrice, name: "outputPrice" })}
      ${field({ id: "calls", label: text.labels.calls, value: calls, step: "1", name: "calls" })}
      ${field({ id: "api-users", label: text.labels.apiUsers, value: users, step: "1", name: "users" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.perCall, value: precise.money(result.perCall) })}
      ${resultRow({ label: text.results.monthlyCost, value: format.money(result.monthly), strong: true })}
      ${resultRow({ label: text.results.perUser, value: result.perUser === null ? text.results.notAvailable : precise.money(result.perUser) })} </dl>
<p class="tool-note">${escapeHtml(text.workflow.apiNote)}</p>` };
}
export function RevenueGoalCalculator({ locale, text, currency, values }) {
    const target = values.target ?? "10000";
    const price = values.price ?? "29";
    const conversion = values.conversion ?? "2";
    const days = values.days ?? "30";
    const format = formatters(locale, currency);
    const result = revenueGoal({ target: toNumber(target), price: toNumber(price), conversionPercent: toNumber(conversion), days: Math.min(31, Math.floor(toNumber(days))) });
    const count = (value) => value === null ? text.results.notAvailable : format.number(value);
    return { inputs: `<div class="tool-inputs">
      ${field({ id: "revenue-target", label: text.labels.revenueTarget, value: target, name: "target" })}
      ${field({ id: "price", label: text.labels.price, value: price, name: "price" })}
      ${field({ id: "sales-conversion", label: text.labels.salesConversion, value: conversion, max: 100, name: "conversion" })}
      ${field({ id: "days", label: text.labels.daysInMonth, value: days, max: 31, step: "1", name: "days" })} </div>`, output: `<dl class="tool-results" aria-live="polite">
      ${resultRow({ label: text.results.targetCustomers, value: count(result.customers), strong: true })}
      ${resultRow({ label: text.results.targetVisitors, value: count(result.visitors) })}
      ${resultRow({ label: text.results.dailyVisitors, value: count(result.dailyVisitors) })} </dl>
<p class="tool-note">${escapeHtml(text.workflow.goalNote)}</p>` };
}
