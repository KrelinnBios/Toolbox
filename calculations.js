export const TOOL_SLUGS = [
    "pricing-profit-calculator",
    "mrr-calculator",
    "ltv-cac-calculator",
    "churn-rate-calculator",
    "pricing-adjustment-calculator",
    "freelance-income-calculator",
    "runway-calculator",
    "tax-reserve-calculator",
    "referral-loop-calculator",
    "conversion-rate-calculator",
    "nrr-calculator",
    "ai-api-cost-calculator",
    "revenue-goal-calculator",
    "subscription-cost-calculator",
    "ad-roas-calculator",
    "tiered-pricing-calculator",
    "refund-chargeback-calculator",
    "sponsorship-cpm-calculator",
    "email-list-growth-calculator",
    "outsource-vs-diy-calculator",
    "lifetime-vs-subscription-calculator",
    "affiliate-commission-calculator",
    "mrr-goal-calculator",
    "loan-payment-calculator",
    "compound-savings-calculator",
    "bmi-calculator",
    "daily-calorie-calculator",
    "date-difference-calculator",
    "overtime-pay-calculator",
    "meeting-cost-calculator",
    "video-revenue-calculator",
    "fan-growth-calculator",
    "engagement-rate-calculator",
    "cashflow-projection-calculator",
    "growth-rate-calculator",
];
export const TOOL_CATEGORIES = [
    {
        id: "revenue",
        slugs: ["pricing-profit-calculator", "mrr-calculator", "pricing-adjustment-calculator", "tiered-pricing-calculator", "refund-chargeback-calculator", "sponsorship-cpm-calculator", "lifetime-vs-subscription-calculator"],
    },
    {
        id: "growth",
        slugs: ["ltv-cac-calculator", "churn-rate-calculator", "nrr-calculator", "referral-loop-calculator", "conversion-rate-calculator", "revenue-goal-calculator", "ad-roas-calculator", "email-list-growth-calculator", "affiliate-commission-calculator", "mrr-goal-calculator", "growth-rate-calculator"],
    },
    {
        id: "planning",
        slugs: ["freelance-income-calculator", "runway-calculator", "tax-reserve-calculator", "ai-api-cost-calculator", "subscription-cost-calculator", "outsource-vs-diy-calculator", "cashflow-projection-calculator"],
    },
    {
        id: "life",
        slugs: ["loan-payment-calculator", "compound-savings-calculator", "bmi-calculator", "daily-calorie-calculator"],
    },
    {
        id: "time",
        slugs: ["date-difference-calculator", "overtime-pay-calculator", "meeting-cost-calculator"],
    },
    {
        id: "creator",
        slugs: ["video-revenue-calculator", "fan-growth-calculator", "engagement-rate-calculator"],
    },
];
export function toolCategoryOf(slug) {
    const found = TOOL_CATEGORIES.find((category) => category.slugs.includes(slug));
    if (!found)
        throw new Error(`Tool ${slug} has no category`);
    return found.id;
}
export function isToolSlug(value) {
    return TOOL_SLUGS.includes(value);
}
export const TOOL_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "HKD", "TWD"];
export function isToolCurrency(value) {
    return TOOL_CURRENCIES.includes(value);
}
export const MAX_PROJECTION_MONTHS = 60;
export function pricingProfit(input) {
    const feeFixed = input.price > 0 ? input.feeFixed : 0;
    const variableCosts = input.variableCost * input.customers;
    const profit = saasProfit({
        ...input,
        feeFixed,
        costs: input.costs + variableCosts,
    });
    const fees = paymentFees(input);
    const perUnitFees = fees.fees;
    const threshold = breakEven({ fixedCosts: input.costs, price: input.price, variableCost: input.variableCost + perUnitFees });
    const breakdown = {
        percentFees: profit.revenue * (input.feePercent / 100),
        fixedFees: feeFixed * input.customers,
        variableCosts,
        operatingCosts: input.costs,
        annualProfit: profit.profit * 12,
        customersToBreakEven: threshold.units === null ? null : Math.max(0, Math.ceil(threshold.units - input.customers)),
    };
    return { profit, fees, threshold, breakdown };
}
export function projectQuote(input) {
    const base = input.hours * input.hourlyRate + input.extraCosts;
    const reserve = base * input.reservePercent / 100;
    return { base, reserve, quote: base + reserve };
}
export function aiApiCost(input) {
    const perCall = (input.inputTokens * input.inputPrice + input.outputTokens * input.outputPrice) / 1_000_000;
    const monthly = perCall * input.calls;
    return { perCall, monthly, perUser: input.users > 0 ? monthly / input.users : null };
}
export function revenueGoal(input) {
    const customers = input.target === 0 ? 0 : input.price > 0 ? Math.ceil(input.target / input.price) : null;
    const conversion = Math.min(100, Math.max(0, input.conversionPercent));
    const visitors = customers === 0 ? 0 : customers !== null && conversion > 0 ? Math.ceil(customers / (conversion / 100)) : null;
    return { customers, visitors, dailyVisitors: visitors !== null && input.days > 0 ? Math.ceil(visitors / input.days) : null };
}
export function subscriptionCosts(items) {
    const monthlyAmounts = items.map(item => item.period === "annual" ? item.amount / 12 : item.amount);
    const monthly = monthlyAmounts.reduce((total, amount) => total + amount, 0);
    return { monthly, annual: monthly * 12, shares: monthlyAmounts.map(amount => monthly > 0 ? amount / monthly * 100 : 0) };
}
export function saasProfit(input) {
    const revenue = input.price * input.customers;
    const fees = revenue * (input.feePercent / 100) + input.feeFixed * input.customers;
    const netRevenue = revenue - fees;
    const profit = netRevenue - input.costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, fees, netRevenue, profit, margin };
}
export function mrrProjection(input) {
    const mrr = input.price * input.customers;
    const months = Math.min(MAX_PROJECTION_MONTHS, Math.max(1, Math.floor(input.months)));
    const monthlyChange = (input.growthPercent - input.churnPercent) / 100;
    const points = [];
    let customers = input.customers;
    for (let month = 1; month <= months; month += 1) {
        customers = Math.max(0, customers * (1 + monthlyChange));
        points.push({ month, customers, mrr: customers * input.price });
    }
    const last = points[points.length - 1];
    return {
        mrr,
        arr: mrr * 12,
        points,
        projectedCustomers: last.customers,
        projectedMrr: last.mrr,
        projectedArr: last.mrr * 12,
    };
}
export function breakEven(input) {
    const contribution = input.price - input.variableCost;
    if (contribution <= 0) {
        return { contribution, units: null, revenue: null, contributionMargin: 0 };
    }
    const units = Math.max(0, Math.ceil(input.fixedCosts / contribution - 1e-9));
    return {
        contribution,
        units,
        revenue: units * input.price,
        contributionMargin: (contribution / input.price) * 100,
    };
}
export function paymentFees(input) {
    const fees = input.price > 0 ? input.price * (input.feePercent / 100) + input.feeFixed : 0;
    const net = input.price - fees;
    const effectiveRate = input.price > 0 ? (fees / input.price) * 100 : 0;
    const priceForTarget = input.targetNet > 0 && input.feePercent < 100
        ? (input.targetNet + input.feeFixed) / (1 - input.feePercent / 100)
        : null;
    return { fees, net, effectiveRate, priceForTarget };
}
export function ltvCac(input) {
    const monthlyProfit = input.arpu * (input.marginPercent / 100);
    const lifetimeMonths = input.churnPercent > 0 ? 100 / input.churnPercent : null;
    const ltv = lifetimeMonths === null ? null : monthlyProfit * lifetimeMonths;
    const ratio = ltv !== null && input.cac > 0 ? ltv / input.cac : null;
    const paybackMonths = monthlyProfit > 0 ? input.cac / monthlyProfit : null;
    return { monthlyProfit, lifetimeMonths, ltv, ratio, paybackMonths };
}
export function churnStats(input) {
    const lost = Math.min(input.lostCustomers, input.startCustomers);
    const rate = input.startCustomers > 0 ? (lost / input.startCustomers) * 100 : 0;
    const annualChurn = (1 - Math.pow(1 - rate / 100, 12)) * 100;
    return {
        rate,
        retention: 100 - rate,
        annualChurn,
        lifetimeMonths: rate > 0 ? 100 / rate : null,
    };
}
export function annualPricing(input) {
    const discount = Math.min(100, Math.max(0, input.discountPercent));
    const fullYear = input.monthlyPrice * 12;
    const annualPrice = fullYear * (1 - discount / 100);
    const savings = fullYear - annualPrice;
    return {
        fullYear,
        annualPrice,
        monthlyEquivalent: annualPrice / 12,
        savings,
        freeMonths: input.monthlyPrice > 0 ? savings / input.monthlyPrice : 0,
    };
}
export function freelanceRate(input) {
    const tax = Math.min(99, Math.max(0, input.taxPercent));
    const requiredRevenue = input.targetIncome / (1 - tax / 100) + input.expenses;
    const workingWeeks = Math.max(0, 52 - input.weeksOff);
    const billableHours = workingWeeks * input.hoursPerWeek;
    return {
        requiredRevenue,
        billableHours,
        hourlyRate: billableHours > 0 ? requiredRevenue / billableHours : null,
    };
}
export function runway(input) {
    const netBurn = input.monthlyExpenses - input.monthlyRevenue;
    const months = netBurn > 0 ? input.cash / netBurn : null;
    return {
        netBurn,
        months,
        // 6 months is the usual cushion before raising or cutting costs.
        shortRunway: months !== null && months < 6,
        breakEvenMonths: netBurn > 0 ? Math.ceil(months ?? 0) : 0,
    };
}
export function taxReserve(input) {
    const taxableProfit = Math.max(0, input.annualRevenue - input.annualExpenses);
    const tax = Math.min(99, Math.max(0, input.taxPercent));
    const reserve = taxableProfit * (tax / 100);
    return {
        taxableProfit,
        reserve,
        monthlySetAside: reserve / 12,
        afterTax: taxableProfit - reserve,
    };
}
export function discountImpact(input) {
    const discount = Math.min(100, Math.max(0, input.discountPercent));
    const margin = Math.min(100, Math.max(0, input.marginPercent));
    const discountedPrice = input.price * (1 - discount / 100);
    const unitCost = input.price * (1 - margin / 100);
    const profitBefore = input.price - unitCost;
    const profitAfter = discountedPrice - unitCost;
    return {
        discountedPrice,
        unitCost,
        profitBefore,
        profitAfter,
        marginAfter: discountedPrice > 0 ? (profitAfter / discountedPrice) * 100 : 0,
        // How many more units the discount must sell just to keep the same profit.
        volumeMultiplier: profitAfter > 0 ? profitBefore / profitAfter : null,
    };
}
export function hourlyToSalary(input) {
    const weeks = Math.min(52, Math.max(1, input.weeksPerYear));
    const annual = input.hourlyRate * input.hoursPerWeek * weeks;
    return {
        annual,
        monthly: annual / 12,
        weekly: annual / weeks,
    };
}
export function referralLoop(input) {
    const conversion = Math.min(100, Math.max(0, input.conversionPercent));
    const viralCoefficient = input.invitesPerUser * (conversion / 100);
    // Each seeded user ends up accounting for 1/(1-K) users once the loop settles,
    // but only while K stays below 1; at or above 1 the loop never settles.
    const amplification = viralCoefficient < 1 ? 1 / (1 - viralCoefficient) : null;
    return {
        viralCoefficient,
        amplification,
        selfSustaining: viralCoefficient >= 1,
    };
}
export function conversionRate(input) {
    const conversions = Math.min(input.visitors, Math.max(0, input.conversions));
    const rate = input.visitors > 0 ? (conversions / input.visitors) * 100 : 0;
    return {
        conversions,
        rate,
        // Visitors one conversion costs, i.e. the inverse of the rate.
        visitorsPerConversion: conversions > 0 ? input.visitors / conversions : null,
    };
}
export function priceIncrease(input) {
    const currentRevenue = input.price * input.customers;
    const newRevenue = input.newPrice * input.customers;
    const difference = newRevenue - currentRevenue;
    const percent = input.price > 0 ? ((input.newPrice - input.price) / input.price) * 100 : 0;
    // Customers that can be lost before the new price earns less than the old one.
    const tolerableLoss = input.newPrice > 0
        ? Math.max(0, input.customers - currentRevenue / input.newPrice)
        : 0;
    return {
        currentRevenue,
        newRevenue,
        difference,
        percent,
        tolerableLoss: Math.min(tolerableLoss, input.customers),
        tolerableLossPercent: input.customers > 0 ? (Math.min(tolerableLoss, input.customers) / input.customers) * 100 : 0,
    };
}
export function netRevenueRetention(input) {
    // Downgrades and cancellations can never take away more than the starting MRR.
    const lost = Math.min(input.startMrr, input.contractionMrr + input.churnedMrr);
    const endingMrr = input.startMrr - lost + input.expansionMrr;
    return {
        endingMrr,
        netChange: endingMrr - input.startMrr,
        // Revenue retention is measured on the starting cohort, so new customers are left out.
        nrr: input.startMrr > 0 ? (endingMrr / input.startMrr) * 100 : 0,
        grr: input.startMrr > 0 ? ((input.startMrr - lost) / input.startMrr) * 100 : 0,
    };
}
export function adRoas(input) {
    const conversion = Math.min(100, Math.max(0, input.conversionPercent));
    const margin = Math.min(100, Math.max(0, input.marginPercent));
    const clicks = input.cpc > 0 ? input.budget / input.cpc : 0;
    const customers = clicks * (conversion / 100);
    const revenue = customers * input.price;
    return {
        clicks,
        customers,
        revenue,
        cpa: customers > 0 ? input.budget / customers : null,
        roas: input.budget > 0 ? revenue / input.budget : null,
        profit: revenue * (margin / 100) - input.budget,
        // Ad spend only pays for itself once each unit of spend returns 1 / margin in revenue.
        breakEvenRoas: margin > 0 ? 100 / margin : null,
    };
}
export function tieredPricing(input) {
    // Shares are normalised so a mix that does not add up to 100% still splits every customer.
    const totalShare = input.tiers.reduce((total, tier) => total + Math.max(0, tier.sharePercent), 0);
    const tiers = input.tiers.map(tier => {
        const customers = totalShare > 0 ? input.customers * Math.max(0, tier.sharePercent) / totalShare : 0;
        return { customers, mrr: customers * tier.price };
    });
    const mrr = tiers.reduce((total, tier) => total + tier.mrr, 0);
    return {
        totalShare,
        mrr,
        arr: mrr * 12,
        arpu: input.customers > 0 && totalShare > 0 ? mrr / input.customers : 0,
        tiers: tiers.map(tier => ({ ...tier, revenueShare: mrr > 0 ? tier.mrr / mrr * 100 : 0 })),
    };
}
export function refundChargeback(input) {
    const refundRate = Math.min(100, Math.max(0, input.refundPercent));
    const chargebackRate = Math.min(100 - refundRate, Math.max(0, input.chargebackPercent));
    const refunds = input.revenue * refundRate / 100;
    const chargebacks = input.revenue * chargebackRate / 100;
    const chargebackCount = input.orders * chargebackRate / 100;
    const penalties = chargebackCount * input.chargebackFee;
    const totalLoss = refunds + chargebacks + penalties;
    return {
        refunds,
        chargebacks,
        chargebackCount,
        penalties,
        totalLoss,
        netRevenue: input.revenue - totalLoss,
        lossPercent: input.revenue > 0 ? totalLoss / input.revenue * 100 : 0,
        // Many card processors start monitoring merchants once disputes approach 1% of orders.
        highChargebacks: chargebackRate >= 1,
    };
}
export function sponsorshipCpm(input) {
    const impressions = input.subscribers * Math.min(100, Math.max(0, input.openPercent)) / 100;
    const perIssue = impressions / 1000 * input.cpm;
    const monthly = perIssue * input.issuesPerMonth * Math.min(100, Math.max(0, input.fillPercent)) / 100;
    return { impressions, perIssue, monthly, annual: monthly * 12 };
}
export const MAX_LIST_GROWTH_MONTHS = 600;
// Each month a share of the base is lost, then a fixed amount is added.
function growthWithLosses(input) {
    const keep = 1 - Math.min(100, Math.max(0, input.lossPercent)) / 100;
    const months = Math.min(MAX_PROJECTION_MONTHS, Math.max(1, Math.floor(input.months)));
    let projected = input.start;
    for (let month = 1; month <= months; month += 1)
        projected = projected * keep + input.added;
    // With a steady loss rate the base levels off where monthly losses equal what is added.
    const ceiling = keep < 1 ? input.added / (1 - keep) : null;
    let monthsToTarget = input.target <= input.start ? 0 : null;
    // The base only approaches its ceiling, so a goal at or above it is never reached.
    const reachable = ceiling === null || input.target < ceiling - 1e-9;
    let current = input.start;
    for (let month = 1; reachable && monthsToTarget === null && month <= MAX_LIST_GROWTH_MONTHS; month += 1) {
        current = current * keep + input.added;
        if (current >= input.target - 1e-9)
            monthsToTarget = month;
    }
    return { projected, netAdded: projected - input.start, ceiling, monthsToTarget };
}
export function emailListGrowth(input) {
    return growthWithLosses({
        start: input.startSubscribers,
        added: input.newPerMonth,
        lossPercent: input.unsubscribePercent,
        months: input.months,
        target: input.target,
    });
}
export function mrrGoal(input) {
    return growthWithLosses({
        start: input.currentMrr,
        added: input.newMrr,
        lossPercent: input.churnPercent,
        months: input.months,
        target: input.targetMrr,
    });
}
export function fanGrowth(input) {
    return growthWithLosses({
        start: input.followers,
        added: input.gainedPerMonth,
        lossPercent: input.unfollowPercent,
        months: input.months,
        target: input.targetFans,
    });
}
export function lifetimeVsSubscription(input) {
    const churn = Math.min(100, Math.max(0, input.churnPercent));
    const lifetimeMonths = churn > 0 ? 100 / churn : null;
    // Lifetime buyers are assumed to stay as long as subscribers, and they keep costing money to serve.
    const servingCost = lifetimeMonths === null ? null : input.serviceCost * lifetimeMonths;
    const subscriptionProfit = lifetimeMonths === null ? null : (input.monthlyPrice - input.serviceCost) * lifetimeMonths;
    const lifetimeProfit = servingCost === null ? null : input.lifetimePrice - servingCost;
    return {
        equivalentMonths: input.monthlyPrice > 0 ? input.lifetimePrice / input.monthlyPrice : null,
        lifetimeMonths,
        subscriptionProfit,
        lifetimeProfit,
        gap: subscriptionProfit === null || lifetimeProfit === null ? null : subscriptionProfit - lifetimeProfit,
    };
}
export function affiliateCommission(input) {
    const margin = Math.min(100, Math.max(0, input.marginPercent));
    const commission = input.price * Math.min(100, Math.max(0, input.commissionPercent)) / 100;
    const profit = input.price * margin / 100 - commission;
    return {
        commission,
        profit,
        marginAfter: input.price > 0 ? profit / input.price * 100 : 0,
        // Paying out the whole gross margin is the most a sale can afford before it loses money.
        maxCommissionPercent: margin,
        monthlyCommission: commission * input.sales,
        monthlyProfit: profit * input.sales,
    };
}
export function outsourceVsDiy(input) {
    const diyCost = input.hours * input.hourlyValue;
    const outsourceCost = input.quote + input.managementHours * input.hourlyValue;
    const freedHours = input.hours - input.managementHours;
    return {
        diyCost,
        outsourceCost,
        savings: diyCost - outsourceCost,
        freedHours,
        // Above this value of your own hour, handing the work off costs less than doing it.
        breakEvenValue: freedHours > 0 ? input.quote / freedHours : null,
    };
}
export function loanPayment(input) {
    const months = Math.max(0, Math.floor(input.months));
    const monthlyRate = input.annualRatePercent / 100 / 12;
    if (months === 0) return { monthlyPayment: 0, totalRepaid: 0, totalInterest: 0 };
    if (monthlyRate <= 0) {
        const payment = input.principal / months;
        return { monthlyPayment: payment, totalRepaid: input.principal, totalInterest: 0 };
    }
    const payment = input.principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    const totalRepaid = payment * months;
    return { monthlyPayment: payment, totalRepaid, totalInterest: totalRepaid - input.principal };
}
export function compoundSavings(input) {
    const months = Math.min(MAX_PROJECTION_MONTHS * 12, Math.max(0, Math.floor(input.months)));
    const monthlyRate = input.annualRatePercent / 100 / 12;
    const contributions = input.initial + input.monthlyAdd * months;
    let value = input.initial;
    for (let month = 1; month <= months; month += 1)
        value = value * (1 + monthlyRate) + input.monthlyAdd;
    return { futureValue: value, contributions, interest: value - contributions };
}
export function bmi(input) {
    const meters = input.heightCm / 100;
    if (meters <= 0) {
        return { bmi: 0, categoryIndex: null, healthyWeightMin: null, healthyWeightMax: null };
    }
    const square = meters * meters;
    const bmiValue = input.weightKg / square;
    // 中国成人标准：<18.5 偏瘦，18.5–24 正常，24–28 超重，≥28 肥胖。
    const categoryIndex = bmiValue < 18.5 ? 0 : bmiValue < 24 ? 1 : bmiValue < 28 ? 2 : 3;
    return {
        bmi: bmiValue,
        categoryIndex,
        healthyWeightMin: 18.5 * square,
        healthyWeightMax: 24 * square,
    };
}
export function basalMetabolicRate(input) {
    const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
    // Mifflin-St Jeor 公式按生理性别加一个常数项。
    const sexAdjustment = input.sex === "female" ? -161 : 5;
    return Math.max(0, base + sexAdjustment);
}
export function dailyCalorie(input) {
    const bmr = basalMetabolicRate(input);
    return { bmr, tdee: bmr * input.activityFactor };
}
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
function parseIsoDate(value) {
    const match = DATE_PATTERN.exec(String(value).trim());
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    // Reject rollovers like 2025-02-31 that Date.UTC silently accepts.
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date;
}
export function dateDifference(input) {
    const from = parseIsoDate(input.from);
    const to = parseIsoDate(input.to);
    if (from === null || to === null) {
        return { valid: false, days: null, wholeWeeks: null, remainingDays: null, businessDays: null, weekendDays: null };
    }
    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.round((to.getTime() - from.getTime()) / dayMs);
    const fromUtc = new Date(from.getTime());
    let businessDays = 0;
    let weekendDays = 0;
    const sign = totalDays >= 0 ? 1 : -1;
    // Count each day in between, excluding both endpoints by convention.
    for (let day = 1; day <= Math.abs(totalDays); day += 1) {
        fromUtc.setUTCDate(fromUtc.getUTCDate() + sign);
        const weekday = fromUtc.getUTCDay();
        if (weekday === 0 || weekday === 6) weekendDays += 1;
        else businessDays += 1;
    }
    const absoluteDays = Math.abs(totalDays);
    const direction = totalDays < 0 ? -1 : 1;
    return {
        valid: true,
        days: totalDays,
        wholeWeeks: Math.floor(absoluteDays / 7) * (totalDays < 0 ? -1 : 1),
        remainingDays: (absoluteDays % 7) * (totalDays < 0 ? -1 : 1),
        businessDays: businessDays * direction,
        weekendDays: weekendDays * direction,
    };
}
export function overtimePay(input) {
    const hourPay = input.hourlyWage;
    const weekday = hourPay * input.weekdayHours * 1.5;
    const weekend = hourPay * input.weekendHours * 2;
    const holiday = hourPay * input.holidayHours * 3;
    return {
        weekdayPay: weekday,
        weekendPay: weekend,
        holidayPay: holiday,
        totalPay: weekday + weekend + holiday,
        totalHours: input.weekdayHours + input.weekendHours + input.holidayHours,
    };
}
export function meetingCost(input) {
    const hours = Math.max(0, input.minutes) / 60;
    const perMeeting = attendees => attendees * input.hourlySalary * hours;
    const perMeetingCost = perMeeting(input.attendees);
    const personHours = input.attendees * hours;
    return {
        perMeeting: perMeetingCost,
        monthly: perMeetingCost * input.timesPerMonth,
        annual: perMeetingCost * input.timesPerMonth * 12,
        personHours,
    };
}
export function videoRevenue(input) {
    const revenuePerVideo = input.views / 1000 * input.rpm * input.sharePercent / 100;
    return {
        perVideo: revenuePerVideo,
        monthly: revenuePerVideo * input.videosPerMonth,
        annual: revenuePerVideo * input.videosPerMonth * 12,
        perTenThousandViews: input.views > 0 ? revenuePerVideo * (10000 / input.views) : 0,
    };
}
export function engagementRate(input) {
    const interactions = input.likes + input.comments + input.shares;
    return {
        interactions,
        rate: input.followers > 0 ? interactions / input.followers * 100 : 0,
        // Interactions that 1 000 followers produce at the same speed.
        perThousandFollowers: input.followers > 0 ? interactions / input.followers * 1000 : 0,
    };
}
export function cashflowProjection(input) {
    const months = Math.min(MAX_PROJECTION_MONTHS, Math.max(1, Math.floor(input.months)));
    const revenueGrowth = 1 + input.revenueGrowthPercent / 100;
    const expenseGrowth = 1 + input.expenseGrowthPercent / 100;
    const points = [];
    let cash = input.cash;
    let revenue = input.monthlyRevenue;
    let expenses = input.monthlyExpenses;
    let lowPoint = cash;
    let exhaustedMonth = null;
    for (let month = 1; month <= months; month += 1) {
        cash += revenue - expenses;
        points.push({ month, revenue, expenses, endCash: cash });
        if (cash < lowPoint) lowPoint = cash;
        if (cash < 0 && exhaustedMonth === null) exhaustedMonth = month;
        revenue *= revenueGrowth;
        expenses *= expenseGrowth;
    }
    return { points, endCash: cash, lowPoint, exhaustedMonth };
}
export function growthRateConvert(input) {
    const periods = Math.max(1, input.periodsPerYear);
    const factor = 1 + input.percent / 100;
    const annual = (Math.pow(factor, periods) - 1) * 100;
    const monthly = (Math.pow(factor, periods / 12) - 1) * 100;
    return { annual, monthly, doublingMonths: input.percent > 0 ? Math.log(2) / (Math.log(factor) * periods / 12) : null };
}
