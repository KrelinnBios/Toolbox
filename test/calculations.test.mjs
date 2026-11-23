import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { adRoas, affiliateCommission, lifetimeVsSubscription, mrrGoal, emailListGrowth, outsourceVsDiy, refundChargeback, sponsorshipCpm, tieredPricing, aiApiCost, pricingProfit, projectQuote, revenueGoal, subscriptionCosts, annualPricing, breakEven, churnStats, conversionRate, discountImpact, freelanceRate, hourlyToSalary, isToolSlug, ltvCac, mrrProjection, netRevenueRetention, paymentFees, priceIncrease, referralLoop, runway, saasProfit, taxReserve, loanPayment, compoundSavings, bmi, dailyCalorie, dateDifference, overtimePay, meetingCost, videoRevenue, fanGrowth, engagementRate, cashflowProjection, growthRateConvert, TOOL_CATEGORIES, TOOL_CURRENCIES, TOOL_SLUGS, toolCategoryOf, } from "../calculations.js";
import { toolsCopyZh } from "../calculator-copy.js";
const toolsCopy = { zh: toolsCopyZh };
describe("免费工具计算", () => {
    it("合并工具：手续费只扣一次，利润与回本销量使用同一组成本", () => {
        const input = { price: 20, customers: 100, feePercent: 3, feeFixed: 0.3, costs: 500, variableCost: 5, targetNet: 18 };
        const { profit, fees, threshold } = pricingProfit(input);
        assert.ok(Math.abs((fees.net) - (19.1)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((profit.fees) - (90)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((profit.profit) - (910)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((threshold.contribution) - (14.1)) < 0.5 * 10 ** -(2));
        assert.strictEqual(threshold.units, 36);
        assert.ok((pricingProfit({ ...input, customers: 35 }).profit.profit) < (0));
        assert.ok((pricingProfit({ ...input, customers: 36 }).profit.profit) >= (0));
        const free = pricingProfit({ ...input, price: 0 });
        assert.strictEqual(free.profit.fees, 0);
        assert.strictEqual(free.fees.net, 0);
        assert.strictEqual(free.threshold.units, null);
        assert.strictEqual(pricingProfit({ ...input, feePercent: 100 }).fees.priceForTarget, null);
    });
    it("合并工具：费用明细各项相加等于总扣费与利润", () => {
        const input = { price: 100, customers: 1, feePercent: 5.5, feeFixed: 0.4, costs: 5, variableCost: 0, targetNet: 0 };
        const { profit, breakdown, threshold } = pricingProfit(input);
        assert.ok(Math.abs(breakdown.percentFees - 5.5) < 1e-9);
        assert.ok(Math.abs(breakdown.fixedFees - 0.4) < 1e-9);
        assert.ok(Math.abs(breakdown.percentFees + breakdown.fixedFees - profit.fees) < 1e-9);
        assert.ok(Math.abs(profit.netRevenue - breakdown.variableCosts - breakdown.operatingCosts - profit.profit) < 1e-9);
        assert.ok(Math.abs(breakdown.annualProfit - 89.1 * 12) < 1e-9);
        assert.strictEqual(threshold.units, 1);
        assert.strictEqual(breakdown.customersToBreakEven, 0);
        const short = pricingProfit({ price: 20, customers: 10, feePercent: 3, feeFixed: 0.3, costs: 500, variableCost: 5, targetNet: 0 });
        assert.strictEqual(short.breakdown.customersToBreakEven, 26);
        assert.strictEqual(pricingProfit({ ...input, price: 0 }).breakdown.fixedFees, 0);
        assert.strictEqual(pricingProfit({ ...input, price: 0 }).breakdown.customersToBreakEven, null);
    });
    it("项目报价：按人工与额外成本合计预留，零输入返回零", () => {
        assert.deepStrictEqual(projectQuote({ hours: 40, hourlyRate: 50, extraCosts: 200, reservePercent: 15 }), { base: 2200, reserve: 330, quote: 2530 });
        assert.deepStrictEqual(projectQuote({ hours: 0, hourlyRate: 0, extraCosts: 0, reservePercent: 15 }), { base: 0, reserve: 0, quote: 0 });
    });
    it("API 成本：每百万 Token 折算，保留单次小额精度", () => {
        const input = { inputTokens: 1000, outputTokens: 500, inputPrice: 1, outputPrice: 4, calls: 10000, users: 100 };
        assert.deepStrictEqual(aiApiCost(input), { perCall: 0.003, monthly: 30, perUser: 0.3 });
        assert.strictEqual(aiApiCost({ ...input, users: 0 }).perUser, null);
        assert.strictEqual(aiApiCost({ ...input, calls: 0 }).monthly, 0);
        assert.strictEqual(aiApiCost({ ...input, inputPrice: 0, outputPrice: 0 }).perCall, 0);
    });
    it("收入目标：人数与访问量向上取整，无法达成时不显示无限大", () => {
        const input = { target: 10000, price: 29, conversionPercent: 2, days: 30 };
        assert.deepStrictEqual(revenueGoal(input), { customers: 345, visitors: 17250, dailyVisitors: 575 });
        assert.strictEqual(revenueGoal({ ...input, price: 0 }).customers, null);
        assert.strictEqual(revenueGoal({ ...input, conversionPercent: 0 }).visitors, null);
        assert.strictEqual(revenueGoal({ ...input, days: 0 }).dailyVisitors, null);
        assert.strictEqual(revenueGoal({ ...input, conversionPercent: 200 }).visitors, 345);
        assert.deepStrictEqual(revenueGoal({ ...input, target: 0, price: 0, conversionPercent: 0 }), { customers: 0, visitors: 0, dailyVisitors: 0 });
        assert.deepStrictEqual(revenueGoal({ target: 101, price: 10, conversionPercent: 3, days: 31 }), { customers: 11, visitors: 367, dailyVisitors: 12 });
    });
    it("订阅开支：统一折算周期，各项占比合计为 100%，空列表为零", () => {
        const result = subscriptionCosts([{ amount: 10, period: "monthly" }, { amount: 240, period: "annual" }]);
        assert.strictEqual(result.monthly, 30);
        assert.strictEqual(result.annual, 360);
        assert.ok(Math.abs((result.shares[0]) - (100 / 3)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.shares.reduce((a, b) => a + b, 0)) - (100)) < 0.5 * 10 ** -(2));
        assert.deepStrictEqual(subscriptionCosts([]), { monthly: 0, annual: 0, shares: [] });
        assert.deepStrictEqual(subscriptionCosts([{ amount: 0, period: "annual" }]).shares, [0]);
    });
    it("简体中文文案完整覆盖全部工具", () => {
        for (const text of Object.values(toolsCopy)) {
            assert.deepStrictEqual(Object.keys(text.tools).sort(), [...TOOL_SLUGS].sort());
            for (const tool of Object.values(text.tools)) {
                assert.strictEqual(Object.values(tool).every(value => value.trim().length > 0), true);
            }
        }
    });
    it("SaaS 利润：扣除比例与固定手续费后减去运营成本", () => {
        const result = saasProfit({
            price: 20,
            customers: 100,
            feePercent: 3,
            feeFixed: 0.3,
            costs: 500,
        });
        assert.strictEqual(result.revenue, 2000);
        assert.ok(Math.abs((result.fees) - (90)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.netRevenue) - (1910)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.profit) - (1410)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.margin) - (70.5)) < 0.5 * 10 ** -(2));
    });
    it("SaaS 利润：没有收入时利润率为 0 而不是 NaN", () => {
        const result = saasProfit({ price: 0, customers: 0, feePercent: 3, feeFixed: 0, costs: 100 });
        assert.strictEqual(result.profit, -100);
        assert.strictEqual(result.margin, 0);
    });
    it("MRR 与 ARR：按净增长率逐月预测", () => {
        const result = mrrProjection({
            price: 10,
            customers: 100,
            growthPercent: 10,
            churnPercent: 5,
            months: 2,
        });
        assert.strictEqual(result.mrr, 1000);
        assert.strictEqual(result.arr, 12000);
        assert.strictEqual((result.points).length, 2);
        assert.ok(Math.abs((result.points[0].customers) - (105)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.projectedCustomers) - (110.25)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.projectedMrr) - (1102.5)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.projectedArr) - (13230)) < 0.5 * 10 ** -(2));
    });
    it("MRR：流失率过高时客户数不会变成负数，月数被限制在 1–60", () => {
        const result = mrrProjection({
            price: 10,
            customers: 10,
            growthPercent: 0,
            churnPercent: 150,
            months: 999,
        });
        assert.strictEqual((result.points).length, 60);
        assert.strictEqual(result.points.every((point) => point.customers >= 0), true);
        assert.strictEqual((mrrProjection({ price: 1, customers: 1, growthPercent: 0, churnPercent: 0, months: 0 }).points).length, 1);
    });
    it("盈亏平衡：向上取整到完整的订单数", () => {
        const result = breakEven({ fixedCosts: 1000, price: 30, variableCost: 10 });
        assert.strictEqual(result.contribution, 20);
        assert.strictEqual(result.units, 50);
        assert.strictEqual(result.revenue, 1500);
        assert.ok(Math.abs((result.contributionMargin) - (66.667)) < 0.5 * 10 ** -(2));
        assert.strictEqual(breakEven({ fixedCosts: 1001, price: 30, variableCost: 10 }).units, 51);
    });
    it("盈亏平衡：单位贡献为零或负数时无法回本", () => {
        assert.strictEqual(breakEven({ fixedCosts: 100, price: 10, variableCost: 10 }).units, null);
        assert.strictEqual(breakEven({ fixedCosts: 100, price: 10, variableCost: 12 }).revenue, null);
        assert.strictEqual(breakEven({ fixedCosts: 0, price: 10, variableCost: 2 }).units, 0);
    });
    it("支付手续费：算出到账金额、实际费率，并反推目标到账所需定价", () => {
        const result = paymentFees({ price: 29, feePercent: 2.9, feeFixed: 0.3, targetNet: 25 });
        assert.ok(Math.abs((result.fees) - (1.141)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.net) - (27.859)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.effectiveRate) - (3.934)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.priceForTarget) - (26.0556)) < 0.5 * 10 ** -(3));
        const priceNet = paymentFees({ price: result.priceForTarget ?? 0, feePercent: 2.9, feeFixed: 0.3, targetNet: 0 }).net;
        assert.ok(Math.abs((priceNet) - (25)) < 0.5 * 10 ** -(2));
    });
    it("支付手续费：价格为 0 时没有费用，费率 100% 时无法反推", () => {
        assert.deepStrictEqual(paymentFees({ price: 0, feePercent: 3, feeFixed: 0.3, targetNet: 0 }), {
            fees: 0,
            net: 0,
            effectiveRate: 0,
            priceForTarget: null,
        });
        assert.strictEqual(paymentFees({ price: 10, feePercent: 100, feeFixed: 0, targetNet: 5 }).priceForTarget, null);
    });
    it("LTV 与 CAC：终身价值、比值与回本月数", () => {
        const result = ltvCac({ arpu: 50, marginPercent: 80, churnPercent: 5, cac: 200 });
        assert.strictEqual(result.monthlyProfit, 40);
        assert.strictEqual(result.lifetimeMonths, 20);
        assert.strictEqual(result.ltv, 800);
        assert.strictEqual(result.ratio, 4);
        assert.strictEqual(result.paybackMonths, 5);
    });
    it("LTV 与 CAC：流失率为 0 或获客成本为 0 时不给出无意义的数字", () => {
        const noChurn = ltvCac({ arpu: 50, marginPercent: 80, churnPercent: 0, cac: 200 });
        assert.strictEqual(noChurn.ltv, null);
        assert.strictEqual(noChurn.ratio, null);
        assert.strictEqual(ltvCac({ arpu: 50, marginPercent: 80, churnPercent: 5, cac: 0 }).ratio, null);
        assert.strictEqual(ltvCac({ arpu: 0, marginPercent: 80, churnPercent: 5, cac: 10 }).paybackMonths, null);
    });
    it("流失率：月流失、留存、年化流失与平均生命周期", () => {
        const result = churnStats({ startCustomers: 200, lostCustomers: 10 });
        assert.strictEqual(result.rate, 5);
        assert.strictEqual(result.retention, 95);
        assert.ok(Math.abs((result.annualChurn) - (45.96)) < 0.5 * 10 ** -(1));
        assert.strictEqual(result.lifetimeMonths, 20);
    });
    it("流失率：流失数不会超过期初客户数，期初为 0 时全部为 0", () => {
        assert.strictEqual(churnStats({ startCustomers: 10, lostCustomers: 50 }).rate, 100);
        const empty = churnStats({ startCustomers: 0, lostCustomers: 5 });
        assert.strictEqual(empty.rate, 0);
        assert.strictEqual(empty.lifetimeMonths, null);
    });
    it("年付定价：折扣换算成年价、折合月价和免费月数", () => {
        const result = annualPricing({ monthlyPrice: 20, discountPercent: 20 });
        assert.strictEqual(result.fullYear, 240);
        assert.strictEqual(result.annualPrice, 192);
        assert.strictEqual(result.monthlyEquivalent, 16);
        assert.strictEqual(result.savings, 48);
        assert.ok(Math.abs((result.freeMonths) - (2.4)) < 0.5 * 10 ** -(2));
        assert.strictEqual(annualPricing({ monthlyPrice: 20, discountPercent: 250 }).annualPrice, 0);
    });
    it("自由职业时薪：税后目标收入加开支，除以全年可计费小时", () => {
        const result = freelanceRate({
            targetIncome: 60000,
            expenses: 6000,
            hoursPerWeek: 20,
            weeksOff: 6,
            taxPercent: 25,
        });
        assert.ok(Math.abs((result.requiredRevenue) - (86000)) < 0.5 * 10 ** -(2));
        assert.strictEqual(result.billableHours, 920);
        assert.ok(Math.abs((result.hourlyRate) - (93.478)) < 0.5 * 10 ** -(2));
        assert.strictEqual(freelanceRate({
            targetIncome: 1,
            expenses: 0,
            hoursPerWeek: 0,
            weeksOff: 0,
            taxPercent: 0,
        }).hourlyRate, null);
    });
    it("每个工具恰好属于一个分类", () => {
        const listed = TOOL_CATEGORIES.flatMap((category) => [...category.slugs]);
        assert.deepStrictEqual([...listed].sort(), [...TOOL_SLUGS].sort());
        assert.strictEqual(toolCategoryOf("churn-rate-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("freelance-income-calculator"), "planning");
        assert.strictEqual(toolCategoryOf("runway-calculator"), "planning");
        assert.strictEqual(toolCategoryOf("referral-loop-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("pricing-adjustment-calculator"), "revenue");
        assert.strictEqual(toolCategoryOf("conversion-rate-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("pricing-profit-calculator"), "revenue");
        assert.strictEqual(toolCategoryOf("ai-api-cost-calculator"), "planning");
        assert.strictEqual(toolCategoryOf("subscription-cost-calculator"), "planning");
        assert.strictEqual(toolCategoryOf("revenue-goal-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("nrr-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("ad-roas-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("email-list-growth-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("tiered-pricing-calculator"), "revenue");
        assert.strictEqual(toolCategoryOf("refund-chargeback-calculator"), "revenue");
        assert.strictEqual(toolCategoryOf("sponsorship-cpm-calculator"), "revenue");
        assert.strictEqual(toolCategoryOf("outsource-vs-diy-calculator"), "planning");
        assert.strictEqual(toolCategoryOf("lifetime-vs-subscription-calculator"), "revenue");
        assert.strictEqual(toolCategoryOf("affiliate-commission-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("mrr-goal-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("growth-rate-calculator"), "growth");
        assert.strictEqual(toolCategoryOf("cashflow-projection-calculator"), "planning");
        assert.strictEqual(toolCategoryOf("loan-payment-calculator"), "life");
        assert.strictEqual(toolCategoryOf("compound-savings-calculator"), "life");
        assert.strictEqual(toolCategoryOf("bmi-calculator"), "life");
        assert.strictEqual(toolCategoryOf("daily-calorie-calculator"), "life");
        assert.strictEqual(toolCategoryOf("date-difference-calculator"), "time");
        assert.strictEqual(toolCategoryOf("overtime-pay-calculator"), "time");
        assert.strictEqual(toolCategoryOf("meeting-cost-calculator"), "time");
        assert.strictEqual(toolCategoryOf("video-revenue-calculator"), "creator");
        assert.strictEqual(toolCategoryOf("fan-growth-calculator"), "creator");
        assert.strictEqual(toolCategoryOf("engagement-rate-calculator"), "creator");
    });
    it("只识别已发布的工具路径", () => {
        assert.strictEqual((TOOL_SLUGS).length, 35);
        assert.strictEqual(new Set(TOOL_SLUGS).size, 35);
        assert.strictEqual(isToolSlug("nrr-calculator"), true);
        assert.strictEqual(isToolSlug("mrr-calculator"), true);
        assert.strictEqual(isToolSlug("freelance-income-calculator"), true);
        assert.strictEqual(isToolSlug("runway-calculator"), true);
        assert.strictEqual(isToolSlug("conversion-rate-calculator"), true);
        assert.strictEqual(isToolSlug("../admin"), false);
    });
    it("金额字段用占位符标注币种，简体中文提供全部币种名称", () => {
        assert.deepStrictEqual(TOOL_CURRENCIES, ["USD", "EUR", "GBP", "JPY", "CNY", "HKD", "TWD"]);
        for (const text of Object.values(toolsCopy)) {
            assert.deepStrictEqual(Object.keys(text.currency.names).sort(), [...TOOL_CURRENCIES].sort());
            assert.ok((TOOL_CURRENCIES).includes(text.currency.defaultCurrency));
            for (const label of Object.values(text.labels)) {
                assert.doesNotMatch(label, /USD|美元/);
            }
            assert.ok((text.labels.price).includes("{currency}"));
        }
        assert.strictEqual(toolsCopy.zh.currency.defaultCurrency, "CNY");
    });
    it("现金流跑道：净烧钱、可支撑月数与六个月安全线", () => {
        const result = runway({ cash: 50000, monthlyExpenses: 4000, monthlyRevenue: 1500 });
        assert.strictEqual(result.netBurn, 2500);
        assert.strictEqual(result.months, 20);
        assert.strictEqual(result.shortRunway, false);
        const tight = runway({ cash: 9000, monthlyExpenses: 4000, monthlyRevenue: 1000 });
        assert.strictEqual(tight.months, 3);
        assert.strictEqual(tight.shortRunway, true);
    });
    it("现金流跑道：收入覆盖支出时没有跑道上限", () => {
        const result = runway({ cash: 10000, monthlyExpenses: 3000, monthlyRevenue: 3000 });
        assert.strictEqual(result.netBurn, 0);
        assert.strictEqual(result.months, null);
        assert.strictEqual(result.shortRunway, false);
        assert.strictEqual(runway({ cash: 10000, monthlyExpenses: 3000, monthlyRevenue: 5000 }).months, null);
    });
    it("税款预留：应税利润不会为负，预留额按月摊分", () => {
        const result = taxReserve({ annualRevenue: 80000, annualExpenses: 15000, taxPercent: 25 });
        assert.strictEqual(result.taxableProfit, 65000);
        assert.strictEqual(result.reserve, 16250);
        assert.ok(Math.abs((result.monthlySetAside) - (1354.167)) < 0.5 * 10 ** -(3));
        assert.strictEqual(result.afterTax, 48750);
        const loss = taxReserve({ annualRevenue: 10000, annualExpenses: 20000, taxPercent: 30 });
        assert.strictEqual(loss.taxableProfit, 0);
        assert.strictEqual(loss.reserve, 0);
    });
    it("折扣影响：折后利润与维持原利润所需的销量倍数", () => {
        const result = discountImpact({ price: 50, discountPercent: 20, marginPercent: 80 });
        assert.strictEqual(result.discountedPrice, 40);
        assert.ok(Math.abs((result.unitCost) - (10)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.profitBefore) - (40)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.profitAfter) - (30)) < 0.5 * 10 ** -(2));
        assert.strictEqual(result.marginAfter, 75);
        assert.ok(Math.abs((result.volumeMultiplier) - (4 / 3)) < 0.5 * 10 ** -(5));
        assert.strictEqual(discountImpact({ price: 50, discountPercent: 90, marginPercent: 80 }).volumeMultiplier, null);
    });
    it("时薪换算：年薪、月薪与每周收入", () => {
        const result = hourlyToSalary({ hourlyRate: 60, hoursPerWeek: 25, weeksPerYear: 48 });
        assert.strictEqual(result.annual, 72000);
        assert.strictEqual(result.monthly, 6000);
        assert.strictEqual(result.weekly, 1500);
        assert.strictEqual(hourlyToSalary({ hourlyRate: 60, hoursPerWeek: 25, weeksPerYear: 999 }).annual, 78000);
    });
    it("推荐裂变：病毒系数与收敛放大倍数", () => {
        const result = referralLoop({ invitesPerUser: 2, conversionPercent: 25 });
        assert.strictEqual(result.viralCoefficient, 0.5);
        assert.strictEqual(result.amplification, 2);
        assert.strictEqual(result.selfSustaining, false);
        const viral = referralLoop({ invitesPerUser: 2, conversionPercent: 50 });
        assert.strictEqual(viral.viralCoefficient, 1);
        assert.strictEqual(viral.amplification, null);
        assert.strictEqual(viral.selfSustaining, true);
        assert.strictEqual(referralLoop({ invitesPerUser: 0, conversionPercent: 50 }).amplification, 1);
    });
    it("转化率：计算转化率和每次转化所需访问量", () => {
        const result = conversionRate({ visitors: 10000, conversions: 250 });
        assert.strictEqual(result.rate, 2.5);
        assert.strictEqual(result.conversions, 250);
        assert.strictEqual(result.visitorsPerConversion, 40);
        const zero = conversionRate({ visitors: 0, conversions: 100 });
        assert.strictEqual(zero.rate, 0);
        assert.strictEqual(zero.conversions, 0);
        assert.strictEqual(zero.visitorsPerConversion, null);
    });
    it("涨价影响：新增收入、可承受流失", () => {
        const result = priceIncrease({ price: 10, newPrice: 12, customers: 1000 });
        assert.strictEqual(result.currentRevenue, 10000);
        assert.strictEqual(result.newRevenue, 12000);
        assert.strictEqual(result.difference, 2000);
        assert.strictEqual(result.percent, 20);
        assert.ok(Math.abs((result.tolerableLoss) - (1000 - 10000 / 12)) < 0.5 * 10 ** -(5));
    });
    it("净收入留存率：扩张、收缩与流失合并成 NRR，GRR 不计入扩张", () => {
        const result = netRevenueRetention({ startMrr: 10000, expansionMrr: 800, contractionMrr: 300, churnedMrr: 500 });
        assert.strictEqual(result.endingMrr, 10000);
        assert.strictEqual(result.netChange, 0);
        assert.ok(Math.abs((result.nrr) - (100)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.grr) - (92)) < 0.5 * 10 ** -(2));
        const growing = netRevenueRetention({ startMrr: 10000, expansionMrr: 2000, contractionMrr: 0, churnedMrr: 500 });
        assert.ok(Math.abs((growing.nrr) - (115)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((growing.grr) - (95)) < 0.5 * 10 ** -(2));
    });
    it("净收入留存率：损失不会超过月初 MRR，月初为 0 时全部为 0", () => {
        const wiped = netRevenueRetention({ startMrr: 1000, expansionMrr: 0, contractionMrr: 800, churnedMrr: 800 });
        assert.strictEqual(wiped.grr, 0);
        assert.strictEqual(wiped.nrr, 0);
        assert.strictEqual(wiped.endingMrr, 0);
        const empty = netRevenueRetention({ startMrr: 0, expansionMrr: 500, contractionMrr: 0, churnedMrr: 0 });
        assert.strictEqual(empty.nrr, 0);
        assert.strictEqual(empty.grr, 0);
    });
    it("广告 ROAS：点击、获客成本、ROAS 与扣除广告费后的毛利", () => {
        const result = adRoas({ budget: 1000, cpc: 0.8, conversionPercent: 2, price: 50, marginPercent: 80 });
        assert.strictEqual(result.clicks, 1250);
        assert.strictEqual(result.customers, 25);
        assert.strictEqual(result.revenue, 1250);
        assert.strictEqual(result.cpa, 40);
        assert.strictEqual(result.roas, 1.25);
        assert.strictEqual(result.profit, 0);
        assert.strictEqual(result.breakEvenRoas, 1.25);
        const none = adRoas({ budget: 0, cpc: 0, conversionPercent: 2, price: 50, marginPercent: 0 });
        assert.strictEqual(none.cpa, null);
        assert.strictEqual(none.roas, null);
        assert.strictEqual(none.breakEvenRoas, null);
    });
    it("多档套餐：按占比拆分用户，占比不足 100% 时按比例换算", () => {
        const result = tieredPricing({ customers: 100, tiers: [{ price: 10, sharePercent: 60 }, { price: 30, sharePercent: 30 }, { price: 100, sharePercent: 10 }] });
        assert.strictEqual(result.mrr, 2500);
        assert.strictEqual(result.arr, 30000);
        assert.strictEqual(result.arpu, 25);
        [24, 36, 40].forEach((share, index) => assert.ok(Math.abs((result.tiers[index].revenueShare) - (share)) < 0.5 * 10 ** -(2)));
        const scaled = tieredPricing({ customers: 100, tiers: [{ price: 10, sharePercent: 30 }, { price: 20, sharePercent: 10 }, { price: 50, sharePercent: 0 }] });
        assert.strictEqual(scaled.tiers[0].customers, 75);
        assert.strictEqual(scaled.mrr, 1250);
        assert.partialDeepStrictEqual(tieredPricing({ customers: 100, tiers: [{ price: 10, sharePercent: 0 }] }), { mrr: 0, arpu: 0 });
    });
    it("退款与拒付：合计损失、拒付手续费与 1% 警戒线", () => {
        const result = refundChargeback({ revenue: 10000, orders: 400, refundPercent: 3, chargebackPercent: 0.5, chargebackFee: 15 });
        assert.strictEqual(result.refunds, 300);
        assert.strictEqual(result.chargebacks, 50);
        assert.strictEqual(result.chargebackCount, 2);
        assert.strictEqual(result.penalties, 30);
        assert.strictEqual(result.totalLoss, 380);
        assert.strictEqual(result.netRevenue, 9620);
        assert.ok(Math.abs((result.lossPercent) - (3.8)) < 0.5 * 10 ** -(2));
        assert.strictEqual(result.highChargebacks, false);
        assert.strictEqual(refundChargeback({ revenue: 100, orders: 10, refundPercent: 80, chargebackPercent: 50, chargebackFee: 0 }).chargebacks, 20);
        assert.partialDeepStrictEqual(refundChargeback({ revenue: 0, orders: 0, refundPercent: 5, chargebackPercent: 1, chargebackFee: 15 }), { lossPercent: 0, highChargebacks: true });
    });
    it("赞助 CPM：按打开数报价，按有赞助的期数折算月收入", () => {
        const result = sponsorshipCpm({ subscribers: 5000, openPercent: 40, cpm: 50, issuesPerMonth: 4, fillPercent: 50 });
        assert.strictEqual(result.impressions, 2000);
        assert.strictEqual(result.perIssue, 100);
        assert.strictEqual(result.monthly, 200);
        assert.strictEqual(result.annual, 2400);
        assert.strictEqual(sponsorshipCpm({ subscribers: 5000, openPercent: 150, cpm: 50, issuesPerMonth: 1, fillPercent: 200 }).monthly, 250);
    });
    it("邮件列表增长：逐月退订后加新增，退订率决定增长上限", () => {
        const result = emailListGrowth({ startSubscribers: 1000, newPerMonth: 100, unsubscribePercent: 10, months: 2, target: 1000 });
        assert.ok(Math.abs((result.projected) - (1000)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.netAdded) - (0)) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs((result.ceiling) - (1000)) < 0.5 * 10 ** -(2));
        assert.strictEqual(result.monthsToTarget, 0);
        assert.strictEqual(emailListGrowth({ startSubscribers: 0, newPerMonth: 100, unsubscribePercent: 10, months: 12, target: 1000 }).monthsToTarget, null);
        const steady = emailListGrowth({ startSubscribers: 0, newPerMonth: 100, unsubscribePercent: 0, months: 999, target: 250 });
        assert.strictEqual(steady.projected, 6000);
        assert.strictEqual(steady.ceiling, null);
        assert.strictEqual(steady.monthsToTarget, 3);
    });
    it("外包还是自己做：外包成本含沟通时间，算出外包开始划算的时薪", () => {
        const result = outsourceVsDiy({ hours: 20, hourlyValue: 50, quote: 600, managementHours: 4 });
        assert.strictEqual(result.diyCost, 1000);
        assert.strictEqual(result.outsourceCost, 800);
        assert.strictEqual(result.savings, 200);
        assert.strictEqual(result.freedHours, 16);
        assert.strictEqual(result.breakEvenValue, 37.5);
        assert.ok(Math.abs((outsourceVsDiy({ hours: 20, hourlyValue: 37.5, quote: 600, managementHours: 4 }).savings) - (0)) < 0.5 * 10 ** -(2));
        assert.strictEqual(outsourceVsDiy({ hours: 2, hourlyValue: 50, quote: 600, managementHours: 3 }).breakEvenValue, null);
    });
    it("买断与订阅：按平均使用时长扣除服务成本后比较利润，流失率为 0 时不比较", () => {
        const result = lifetimeVsSubscription({ lifetimePrice: 200, monthlyPrice: 20, churnPercent: 5, serviceCost: 2 });
        assert.strictEqual(result.equivalentMonths, 10);
        assert.strictEqual(result.lifetimeMonths, 20);
        assert.strictEqual(result.subscriptionProfit, 360);
        assert.strictEqual(result.lifetimeProfit, 160);
        assert.strictEqual(result.gap, 200);
        assert.strictEqual(lifetimeVsSubscription({ lifetimePrice: 500, monthlyPrice: 20, churnPercent: 10, serviceCost: 0 }).gap, -300);
        const noChurn = lifetimeVsSubscription({ lifetimePrice: 200, monthlyPrice: 0, churnPercent: 0, serviceCost: 2 });
        assert.partialDeepStrictEqual(noChurn, { equivalentMonths: null, lifetimeMonths: null, gap: null });
    });
    it("联盟分佣：每单分佣、扣除后利润，分佣不能超过毛利率", () => {
        const result = affiliateCommission({ price: 50, marginPercent: 80, commissionPercent: 30, sales: 20 });
        assert.strictEqual(result.commission, 15);
        assert.strictEqual(result.profit, 25);
        assert.strictEqual(result.marginAfter, 50);
        assert.strictEqual(result.maxCommissionPercent, 80);
        assert.strictEqual(result.monthlyCommission, 300);
        assert.strictEqual(result.monthlyProfit, 500);
        assert.strictEqual(affiliateCommission({ price: 50, marginPercent: 40, commissionPercent: 50, sales: 1 }).profit, -5);
        assert.strictEqual(affiliateCommission({ price: 0, marginPercent: 80, commissionPercent: 30, sales: 1 }).marginAfter, 0);
    });
    it("MRR 目标：与邮件列表同一增长模型，目标不低于上限时无法达到", () => {
        const result = mrrGoal({ currentMrr: 0, newMrr: 1000, churnPercent: 0, months: 3, targetMrr: 2500 });
        assert.strictEqual(result.projected, 3000);
        assert.strictEqual(result.monthsToTarget, 3);
        assert.strictEqual(result.ceiling, null);
        const capped = mrrGoal({ currentMrr: 2000, newMrr: 500, churnPercent: 5, months: 12, targetMrr: 10000 });
        assert.ok(Math.abs((capped.ceiling) - (10000)) < 0.5 * 10 ** -(2));
        assert.strictEqual(capped.monthsToTarget, null);
        assert.strictEqual(mrrGoal({ currentMrr: 5000, newMrr: 0, churnPercent: 5, months: 1, targetMrr: 4000 }).monthsToTarget, 0);
    });
    it("贷款月供：等额本息月供与总利息，零利率时平摊本金", () => {
        const result = loanPayment({ principal: 300000, annualRatePercent: 4, months: 240 });
        assert.ok(Math.abs(result.monthlyPayment - 1817.94) < 0.01);
        assert.ok(Math.abs(result.totalRepaid - 436305.84) < 0.01);
        assert.ok(Math.abs(result.totalInterest - 136305.84) < 0.01);
        const zero = loanPayment({ principal: 12000, annualRatePercent: 0, months: 12 });
        assert.strictEqual(zero.monthlyPayment, 1000);
        assert.strictEqual(zero.totalInterest, 0);
        assert.deepStrictEqual(loanPayment({ principal: 300000, annualRatePercent: 4, months: 0 }), { monthlyPayment: 0, totalRepaid: 0, totalInterest: 0 });
        assert.ok(Math.abs(loanPayment({ principal: 100000, annualRatePercent: -5, months: 12 }).monthlyPayment - 100000 / 12) < 1e-9);
    });
    it("存款复利：按月复利叠加定存，利息等于到期金额减累计本金", () => {
        const result = compoundSavings({ initial: 10000, monthlyAdd: 2000, annualRatePercent: 2.5, months: 36 });
        assert.ok(Math.abs(result.futureValue - 85466.06) < 0.01);
        assert.strictEqual(result.contributions, 82000);
        assert.ok(Math.abs(result.interest - 3466.06) < 0.01);
        const zeroRate = compoundSavings({ initial: 100, monthlyAdd: 10, annualRatePercent: 0, months: 5 });
        assert.strictEqual(zeroRate.futureValue, 150);
        assert.strictEqual(compoundSavings({ initial: 0, monthlyAdd: 0, annualRatePercent: 3, months: 12 }).futureValue, 0);
    });
    it("BMI：按中国标准划分范围并给出健康体重区间，身高为 0 时无法计算", () => {
        const result = bmi({ heightCm: 170, weightKg: 65 });
        assert.ok(Math.abs(result.bmi - 22.49) < 0.01);
        assert.strictEqual(result.categoryIndex, 1);
        assert.ok(Math.abs(result.healthyWeightMin - 53.465) < 0.001);
        assert.ok(Math.abs(result.healthyWeightMax - 69.36) < 0.001);
        assert.strictEqual(bmi({ heightCm: 0, weightKg: 65 }).categoryIndex, null);
        assert.strictEqual(bmi({ heightCm: 170, weightKg: 80 }).categoryIndex, 2);
        assert.strictEqual(bmi({ heightCm: 170, weightKg: 95 }).categoryIndex, 3);
        assert.strictEqual(bmi({ heightCm: 160, weightKg: 45 }).categoryIndex, 0);
    });
    it("每日卡路里：按性别修正基础代谢，活动水平折算总消耗", () => {
        const male = dailyCalorie({ sex: "male", age: 30, heightCm: 170, weightKg: 65, activityFactor: 1.375 });
        assert.strictEqual(male.bmr, 1567.5);
        assert.ok(Math.abs(male.tdee - 2155.3125) < 0.001);
        const female = dailyCalorie({ sex: "female", age: 30, heightCm: 170, weightKg: 65, activityFactor: 1 });
        assert.strictEqual(female.bmr, 1567.5 - 166);
        assert.strictEqual(female.tdee, female.bmr);
    });
    it("日期间隔：不包含开始当天，工作日与周末分别统计，无效日期标记为不可用", () => {
        const result = dateDifference({ from: "2025-01-01", to: "2025-03-01" });
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.days, 59);
        assert.strictEqual(result.wholeWeeks, 8);
        assert.strictEqual(result.remainingDays, 3);
        assert.strictEqual(result.businessDays, 42);
        assert.strictEqual(result.weekendDays, 17);
        const reversed = dateDifference({ from: "2025-03-01", to: "2025-01-01" });
        assert.strictEqual(reversed.days, -59);
        assert.strictEqual(reversed.valid, true);
        assert.strictEqual(dateDifference({ from: "2025-02-31", to: "2025-03-01" }).valid, false);
        assert.strictEqual(dateDifference({ from: "", to: "" }).days, null);
    });
    it("加班费：按 1.5、2、3 倍三档累计", () => {
        const result = overtimePay({ hourlyWage: 100, weekdayHours: 10, weekendHours: 8, holidayHours: 4 });
        assert.strictEqual(result.weekdayPay, 1500);
        assert.strictEqual(result.weekendPay, 1600);
        assert.strictEqual(result.holidayPay, 1200);
        assert.strictEqual(result.totalPay, 4300);
        assert.strictEqual(result.totalHours, 22);
        assert.strictEqual(overtimePay({ hourlyWage: 100, weekdayHours: 0, weekendHours: 0, holidayHours: 0 }).totalPay, 0);
    });
    it("会议成本：每场、每月、全年按人均时薪累计", () => {
        const result = meetingCost({ attendees: 6, hourlySalary: 80, minutes: 60, timesPerMonth: 8 });
        assert.strictEqual(result.perMeeting, 480);
        assert.strictEqual(result.monthly, 3840);
        assert.strictEqual(result.annual, 46080);
        assert.strictEqual(result.personHours, 6);
        assert.strictEqual(meetingCost({ attendees: 3, hourlySalary: 100, minutes: 90, timesPerMonth: 0 }).monthly, 0);
    });
    it("视频收益：千次播放收益按分成比例折算，单条到月度到年度", () => {
        const result = videoRevenue({ views: 50000, rpm: 20, sharePercent: 100, videosPerMonth: 8 });
        assert.strictEqual(result.perVideo, 1000);
        assert.strictEqual(result.monthly, 8000);
        assert.strictEqual(result.annual, 96000);
        assert.strictEqual(result.perTenThousandViews, 200);
        const shared = videoRevenue({ views: 50000, rpm: 20, sharePercent: 50, videosPerMonth: 0 });
        assert.strictEqual(shared.perVideo, 500);
        assert.strictEqual(shared.monthly, 0);
        assert.strictEqual(videoRevenue({ views: 0, rpm: 0, sharePercent: 100, videosPerMonth: 2 }).perVideo, 0);
    });
    it("互动率：总互动量除以粉丝数，换算每千粉互动量", () => {
        const result = engagementRate({ followers: 10000, likes: 800, comments: 120, shares: 60 });
        assert.strictEqual(result.interactions, 980);
        assert.strictEqual(result.rate, 9.8);
        assert.strictEqual(result.perThousandFollowers, 98);
        assert.strictEqual(engagementRate({ followers: 0, likes: 10, comments: 5, shares: 1 }).rate, 0);
    });
    it("粉丝增长：与邮件列表同一模型，掉粉率决定增长上限", () => {
        const result = fanGrowth({ followers: 1000, gainedPerMonth: 100, unfollowPercent: 10, months: 2, targetFans: 1000 });
        assert.ok(Math.abs(result.projected - 1000) < 0.5 * 10 ** -(2));
        assert.ok(Math.abs(result.ceiling - 1000) < 0.5 * 10 ** -(2));
        assert.strictEqual(result.monthsToTarget, 0);
        const steady = fanGrowth({ followers: 0, gainedPerMonth: 100, unfollowPercent: 0, months: 999, targetFans: 250 });
        assert.strictEqual(steady.projected, 6000);
        assert.strictEqual(steady.monthsToTarget, 3);
    });
    it("现金流预测：逐月累计现金并找出最低点，耗尽月份仅报告第一次", () => {
        const result = cashflowProjection({ cash: 20000, monthlyRevenue: 3000, revenueGrowthPercent: 5, monthlyExpenses: 4000, expenseGrowthPercent: 2, months: 12 });
        assert.strictEqual(result.points.length, 12);
        assert.ok(Math.abs(result.endCash - 14103.02) < 0.01);
        assert.ok(Math.abs(result.lowPoint - 13934.79) < 0.01);
        assert.strictEqual(result.exhaustedMonth, null);
    });
    it("现金流预测：收入覆盖不了支出时报告首次耗尽月份", () => {
        const wiped = cashflowProjection({ cash: 1000, monthlyRevenue: 100, revenueGrowthPercent: -50, monthlyExpenses: 2000, expenseGrowthPercent: 0, months: 12 });
        assert.strictEqual(wiped.exhaustedMonth, 1);
        assert.ok(wiped.lowPoint < 0);
        assert.strictEqual(cashflowProjection({ cash: 0, monthlyRevenue: 0, revenueGrowthPercent: 0, monthlyExpenses: 0, expenseGrowthPercent: 0, months: 5 }).endCash, 0);
    });
    it("增长率换算：按复利折算年化与月度，并给出倍增时间", () => {
        const result = growthRateConvert({ percent: 5, periodsPerYear: 12 });
        assert.ok(Math.abs(result.annual - 79.59) < 0.01);
        assert.ok(Math.abs(result.monthly - 5) < 1e-6);
        assert.ok(Math.abs(result.doublingMonths - 14.21) < 0.01);
        const weekly = growthRateConvert({ percent: 1, periodsPerYear: 52 });
        assert.ok(Math.abs(weekly.annual - 67.77) < 0.01);
        assert.strictEqual(growthRateConvert({ percent: 0, periodsPerYear: 12 }).doublingMonths, null);
        assert.strictEqual(growthRateConvert({ percent: -10, periodsPerYear: 12 }).doublingMonths, null);
    });
});
