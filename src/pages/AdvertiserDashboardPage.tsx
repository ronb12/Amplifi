import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiBarChart2, FiCheckCircle, FiCreditCard, FiMousePointer, FiPlayCircle, FiShield, FiTarget, FiTrendingUp } from 'react-icons/fi';
import {
  DIRECT_SPONSORSHIP_PLATFORM_RATE,
  MIN_BRAND_CAMPAIGN_BUDGET,
  PREMIUM_PRE_ROLL_CPM,
  SELF_SERVE_CPM,
  useAd,
  type AdType
} from '../contexts/AdContext';
import { startAdvertiserCampaignCheckout } from '../services/monetization';

const adTypes: AdType[] = ['pre-roll', 'mid-roll', 'banner', 'sponsored-card'];

const defaultForm = {
  title: '',
  advertiser: '',
  description: '',
  clickUrl: '',
  type: 'pre-roll' as AdType,
  targetCategories: 'react, javascript, web',
  targetAudience: 'developers, creators',
  excludedKeywords: 'adult, gambling, scam',
  budget: '500',
  cpm: '10',
  cpc: '1.25',
  duration: '15'
};

const AdvertiserDashboardPage: React.FC = () => {
  const { ads, adMetrics, createAd, approveAd, rejectAd, fundCampaign } = useAd();
  const [form, setForm] = useState(defaultForm);
  const [sponsorshipAmount, setSponsorshipAmount] = useState('1500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCampaigns = ads.filter(ad => ad.status === 'active');
  const reviewCampaigns = ads.filter(ad => ad.status === 'review');
  const spend = ads.reduce((sum, ad) => sum + ad.spent, 0);
  const budget = ads.reduce((sum, ad) => sum + ad.budget, 0);

  const campaignRows = useMemo(() => [...ads].sort((a, b) => {
    const order = { review: 0, active: 1, paused: 2, draft: 3, rejected: 4 };
    return order[a.status] - order[b.status];
  }), [ads]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (amount: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);

  const handleCreateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const budgetAmount = Number.parseFloat(form.budget);
      const requiredCpm = form.type === 'pre-roll' ? PREMIUM_PRE_ROLL_CPM : SELF_SERVE_CPM;
      if (!Number.isFinite(budgetAmount) || budgetAmount < MIN_BRAND_CAMPAIGN_BUDGET) {
        toast.error(`Brand campaigns require a ${formatCurrency(MIN_BRAND_CAMPAIGN_BUDGET)} minimum budget`);
        return;
      }
      const ad = createAd({
        title: form.title,
        advertiser: form.advertiser,
        description: form.description,
        clickUrl: form.clickUrl || 'https://example.com',
        type: form.type,
        targetCategories: form.targetCategories.split(',').map(item => item.trim()).filter(Boolean),
        targetAudience: form.targetAudience.split(',').map(item => item.trim()).filter(Boolean),
        excludedKeywords: form.excludedKeywords.split(',').map(item => item.trim()).filter(Boolean),
        budget: 0,
        cpm: requiredCpm,
        cpc: Number.parseFloat(form.cpc) || 1,
        duration: form.type === 'banner' || form.type === 'sponsored-card' ? 0 : Number.parseInt(form.duration, 10) || 15,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().slice(0, 10),
        videoUrl: '',
        thumbnail: '/amplifi-logo.svg',
        skipAfter: form.type === 'pre-roll' ? 5 : undefined
      });

      const checkout = await startAdvertiserCampaignCheckout(ad.id, budgetAmount, form.advertiser);
      if (!checkout.success) {
        toast.error(checkout.error ?? 'Campaign payment could not be started');
        return;
      }

      fundCampaign(ad.id, budgetAmount, checkout.sessionId);
      toast.success(ad.status === 'rejected' ? 'Campaign saved but failed brand-safety review' : 'Campaign funded and sent to review');
      setForm(defaultForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sponsorshipGross = Number.parseFloat(sponsorshipAmount) || 0;
  const sponsorshipFee = sponsorshipGross * DIRECT_SPONSORSHIP_PLATFORM_RATE;
  const sponsorshipCreatorShare = sponsorshipGross - sponsorshipFee;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
          <p className="text-sm text-gray-600">Buy campaigns, pass brand-safety review, and fund creator-first ads.</p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          $10 CPM self-serve • $18 CPM premium pre-roll • 90/10 creator split
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiCreditCard className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Campaign budget</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiTrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm text-gray-600">Tracked spend</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(spend)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiMousePointer className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Clicks</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(adMetrics.totalClicks)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiPlayCircle className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm text-gray-600">Impressions</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(adMetrics.totalImpressions)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleCreateCampaign} className="xl:col-span-1 bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Buy a Campaign</h2>
            <p className="text-sm text-gray-600">
              {formatCurrency(MIN_BRAND_CAMPAIGN_BUDGET)} minimum. Standard ads run at {formatCurrency(SELF_SERVE_CPM)} CPM; pre-roll runs at {formatCurrency(PREMIUM_PRE_ROLL_CPM)} CPM.
            </p>
          </div>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Campaign title" value={form.title} onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))} required />
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Advertiser" value={form.advertiser} onChange={event => setForm(prev => ({ ...prev, advertiser: event.target.value }))} required />
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ad description" rows={3} value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} required />
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Click URL" value={form.clickUrl} onChange={event => setForm(prev => ({ ...prev, clickUrl: event.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg" value={form.type} onChange={event => setForm(prev => ({ ...prev, type: event.target.value as AdType }))}>
              {adTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input className="px-3 py-2 border border-gray-300 rounded-lg" type="number" min={MIN_BRAND_CAMPAIGN_BUDGET} placeholder="Budget" value={form.budget} onChange={event => setForm(prev => ({ ...prev, budget: event.target.value }))} />
          </div>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Target categories" value={form.targetCategories} onChange={event => setForm(prev => ({ ...prev, targetCategories: event.target.value }))} />
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Audience" value={form.targetAudience} onChange={event => setForm(prev => ({ ...prev, targetAudience: event.target.value }))} />
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Excluded keywords" value={form.excludedKeywords} onChange={event => setForm(prev => ({ ...prev, excludedKeywords: event.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <input className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" type="number" readOnly value={form.type === 'pre-roll' ? PREMIUM_PRE_ROLL_CPM : SELF_SERVE_CPM} aria-label="CPM" />
            <input className="px-3 py-2 border border-gray-300 rounded-lg" type="number" min="0.1" step="0.01" placeholder="CPC" value={form.cpc} onChange={event => setForm(prev => ({ ...prev, cpc: event.target.value }))} />
            <input className="px-3 py-2 border border-gray-300 rounded-lg" type="number" min="0" placeholder="Seconds" value={form.duration} onChange={event => setForm(prev => ({ ...prev, duration: event.target.value }))} />
          </div>
          <button disabled={isSubmitting} className="btn-primary w-full disabled:bg-gray-400">
            {isSubmitting ? 'Creating...' : 'Fund campaign'}
          </button>
        </form>

        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
              <p className="text-sm text-gray-600">{activeCampaigns.length} active • {reviewCampaigns.length} in review</p>
            </div>
            <FiBarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-200">
            {campaignRows.map(ad => (
              <div key={ad.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{ad.status}</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{ad.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ad.advertiser} • {ad.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatNumber(ad.impressions)} impressions • {formatNumber(ad.clicks)} clicks • {ad.ctr.toFixed(2)}% CTR</p>
                  </div>
                  <div className="min-w-44">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{formatCurrency(ad.spent)}</span>
                      <span>{formatCurrency(ad.budget)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ad.budget > 0 ? (ad.spent / ad.budget) * 100 : 0)}%` }} />
                    </div>
                  </div>
                </div>
                {ad.status === 'review' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => approveAd(ad.id)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      <FiCheckCircle /> Approve
                    </button>
                    <button onClick={() => rejectAd(ad.id, 'Rejected by manual brand-safety review.')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">
                      <FiShield /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Direct Sponsorship Marketplace</h2>
          <p className="text-sm text-gray-600 mb-4">
            Brands can negotiate creator sponsorships directly. Amplifi handles billing, disclosure tracking, and keeps {(DIRECT_SPONSORSHIP_PLATFORM_RATE * 100).toFixed(0)}%.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              className="px-3 py-2 border border-gray-300 rounded-lg"
              type="number"
              min="100"
              value={sponsorshipAmount}
              onChange={event => setSponsorshipAmount(event.target.value)}
              aria-label="Sponsorship amount"
            />
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Creator receives</p>
              <p className="font-semibold text-gray-900">{formatCurrency(sponsorshipCreatorShare)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Amplifi fee</p>
              <p className="font-semibold text-gray-900">{formatCurrency(sponsorshipFee)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing Rules</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Brand self-serve</p>
              <p className="font-semibold text-gray-900">{formatCurrency(SELF_SERVE_CPM)} CPM</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Premium pre-roll</p>
              <p className="font-semibold text-gray-900">{formatCurrency(PREMIUM_PRE_ROLL_CPM)} CPM</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Minimum budget</p>
              <p className="font-semibold text-gray-900">{formatCurrency(MIN_BRAND_CAMPAIGN_BUDGET)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Creator/platform split</p>
              <p className="font-semibold text-gray-900">90% / 10%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How Serving Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <FiTarget className="w-5 h-5 text-blue-600 mb-2" />
            <p className="font-semibold text-gray-900">Inventory engine</p>
            <p className="text-sm text-gray-600">Matches active, funded campaigns to brand-safe creator videos by category and exclusions.</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <FiShield className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="font-semibold text-gray-900">Fraud controls</p>
            <p className="text-sm text-gray-600">Dedupes repeated impressions, clicks, and watch-throughs inside short abuse windows.</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <FiCreditCard className="w-5 h-5 text-purple-600 mb-2" />
            <p className="font-semibold text-gray-900">90/10 ledger</p>
            <p className="text-sm text-gray-600">Every eligible event records gross revenue, creator share, and platform share.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboardPage;
