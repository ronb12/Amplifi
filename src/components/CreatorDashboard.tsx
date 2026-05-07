import React, { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiDollarSign,
  FiEye,
  FiGift,
  FiMousePointer,
  FiSettings,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiVideo
} from 'react-icons/fi';
import {
  createPayout,
  createStripeAccount,
  getAccountBalance,
  startCreatorBoostCheckout,
  subscriptionTiers,
  tipAmounts,
  type Balance
} from '../services/monetization';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';
import { useLiveEvent } from '../contexts/LiveEventContext';
import { CREATOR_BOOST_DAILY_PRICE, DIRECT_SPONSORSHIP_PLATFORM_RATE, useAd } from '../contexts/AdContext';

interface CreatorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalTips: number;
  totalSubscriptions: number;
  activeSubscribers: number;
}

const CreatorDashboard: React.FC = () => {
  const { user, becomeCreator } = useAuth();
  const { channels, videos } = useVideo();
  const { events } = useLiveEvent();
  const { getCreatorLedger } = useAd();
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [accountBalance, setAccountBalance] = useState<Balance | null>(null);
  const [creatorStats] = useState<CreatorStats>({
    totalEarnings: 1250.75,
    monthlyEarnings: 320.5,
    totalTips: 45,
    totalSubscriptions: 23,
    activeSubscribers: 18
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [boostDays, setBoostDays] = useState(3);
  const creatorChannelId = user?.channelId || '1';
  const creatorChannel = channels.find(channel => channel.id === creatorChannelId) || channels[0];
  const creatorVideos = videos.filter(video => video.channelId === creatorChannelId);
  const creatorEvents = events.filter(event => event.creatorId === creatorChannelId || event.creatorName === user?.displayName);
  const adLedger = getCreatorLedger(creatorChannelId);

  const analytics = useMemo(() => {
    const sourceVideos = creatorVideos.length > 0 ? creatorVideos : videos.filter(video => video.channelId === '1');
    const totalViews = sourceVideos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = sourceVideos.reduce((sum, video) => sum + video.likes, 0);
    const totalComments = sourceVideos.reduce((sum, video) => sum + video.comments, 0);
    const totalDislikes = sourceVideos.reduce((sum, video) => sum + video.dislikes, 0);
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
    const sentimentScore = totalLikes + totalDislikes > 0 ? (totalLikes / (totalLikes + totalDislikes)) * 100 : 0;
    const averageViews = sourceVideos.length > 0 ? totalViews / sourceVideos.length : 0;
    const paidVideos = sourceVideos.filter(video => video.isPayPerView || video.isExclusive);
    const conversionRate = totalViews > 0 ? ((creatorStats.activeSubscribers + paidVideos.length * 18) / totalViews) * 100 : 0;
    const projectedMonthlyRevenue = creatorStats.monthlyEarnings + paidVideos.length * 186 + creatorEvents.length * 92 + adLedger.creatorRevenue;
    const watchTimeHours = Math.round(totalViews * 0.18);
    const returningAudience = Math.min(74, Math.round(32 + engagementRate * 5 + paidVideos.length * 4));
    const topVideo = [...sourceVideos].sort((a, b) => b.views - a.views)[0];
    const fastestGrowingVideo = [...sourceVideos].sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2))[0];
    const maxViews = Math.max(...sourceVideos.map(video => video.views), 1);
    const contentPerformance = [...sourceVideos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(video => ({
        ...video,
        engagement: video.views > 0 ? ((video.likes + video.comments) / video.views) * 100 : 0,
        revenue: (video.isPayPerView ? 420 : 0) + (video.isExclusive ? 280 : 0) + Math.round(video.views * 0.003),
        width: Math.max(8, (video.views / maxViews) * 100)
      }));
    const revenueStreams = [
      { label: 'Memberships', amount: creatorStats.activeSubscribers * 9.99, tone: 'bg-purple-500' },
      { label: 'Tips', amount: creatorStats.totalTips * 7.4, tone: 'bg-pink-500' },
      { label: 'Ad revenue', amount: adLedger.creatorRevenue, tone: 'bg-amber-500' },
      { label: 'PPV + premium', amount: paidVideos.length * 210 + 190, tone: 'bg-blue-500' },
      { label: 'Events', amount: creatorEvents.reduce((sum, event) => sum + event.price * Math.max(1, Math.round(event.currentAttendees * 0.08)), 0), tone: 'bg-emerald-500' }
    ];
    const revenueTotal = revenueStreams.reduce((sum, stream) => sum + stream.amount, 0) || 1;
    const audienceGrowth = [
      { label: 'Mon', value: 42 },
      { label: 'Tue', value: 56 },
      { label: 'Wed', value: 61 },
      { label: 'Thu', value: 74 },
      { label: 'Fri', value: 69 },
      { label: 'Sat', value: 91 },
      { label: 'Sun', value: 104 }
    ];
    const audienceMax = Math.max(...audienceGrowth.map(day => day.value));
    const insights = [
      topVideo ? `${topVideo.title} is carrying ${Math.round((topVideo.views / Math.max(totalViews, 1)) * 100)}% of recent views. Turn it into a series while attention is warm.` : 'Publish at least one flagship video to establish a baseline.',
      engagementRate >= 4 ? 'Engagement is strong. Add a member-only follow-up to convert active commenters.' : 'Engagement is below target. Try a stronger hook and ask one direct question near the end.',
      adLedger.impressions > 0 ? `Ads generated ${adLedger.impressions.toLocaleString()} eligible impressions. Keep videos brand-safe to protect the 90% creator share.` : 'No ad impressions have been attributed yet. Brand-safe public videos can earn from sponsored placements.',
      paidVideos.length > 0 ? 'Premium content is present. Add preview clips on the main feed to increase paid conversion.' : 'No paid content is active for this channel. Add a starter PPV or Insider-only video.',
      creatorEvents.length > 0 ? 'Events are part of the revenue mix. Promote tickets from the channel hub and end screens.' : 'Schedule one live workshop this month to test event revenue.'
    ];

    return {
      totalViews,
      totalLikes,
      totalComments,
      engagementRate,
      sentimentScore,
      averageViews,
      conversionRate,
      projectedMonthlyRevenue,
      watchTimeHours,
      returningAudience,
      topVideo,
      fastestGrowingVideo,
      contentPerformance,
      revenueStreams: revenueStreams.map(stream => ({
        ...stream,
        percent: (stream.amount / revenueTotal) * 100
      })),
      audienceGrowth: audienceGrowth.map(day => ({
        ...day,
        height: (day.value / audienceMax) * 100
      })),
      insights
    };
  }, [adLedger.creatorRevenue, adLedger.impressions, creatorEvents, creatorStats.activeSubscribers, creatorStats.monthlyEarnings, creatorStats.totalTips, creatorVideos, videos]);

  useEffect(() => {
    const demoAccountId = 'acct_demo123';
    setStripeAccountId(demoAccountId);
    getAccountBalance(demoAccountId).then(setAccountBalance);
  }, []);

  const handleCreateStripeAccount = async () => {
    setIsLoading(true);
    try {
      const result = await createStripeAccount(
        user?.email || 'creator@example.com',
        'US',
        user?.id || 'demo-creator'
      );
      if (result.success && result.accountId) {
        setStripeAccountId(result.accountId);
        setAccountBalance(await getAccountBalance(result.accountId));
      } else {
        alert(`Failed to create Stripe account: ${result.error ?? 'Unknown error'}`);
      }
    } catch {
      alert('Error creating Stripe account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayout = async () => {
    const amount = Number.parseFloat(payoutAmount);
    if (!stripeAccountId || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await createPayout(stripeAccountId, amount);
      if (result.success) {
        alert('Payout initiated successfully!');
        setPayoutAmount('');
      } else {
        alert(`Failed to create payout: ${result.error ?? 'Unknown error'}`);
      }
    } catch {
      alert('Error creating payout');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

  const formatCompact = (value: number) =>
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);

  const handleCreatorOnboarding = async () => {
    const result = await becomeCreator();
    if (!result.success) {
      alert(result.error ?? 'Unable to enable creator mode');
    }
  };

  const handleCreatorBoost = async () => {
    setIsBoosting(true);
    try {
      const result = await startCreatorBoostCheckout(creatorChannelId, boostDays, CREATOR_BOOST_DAILY_PRICE);
      if (result.success) {
        alert(`Creator boost queued for ${boostDays} day${boostDays === 1 ? '' : 's'}.`);
      } else {
        alert(result.error ?? 'Unable to start creator boost');
      }
    } finally {
      setIsBoosting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-sm text-gray-600">Track monetization, audience growth, and creator tools.</p>
        </div>
        <button className="btn-primary flex items-center">
          <FiSettings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>

      {!user?.isCreator && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Launch your creator channel</h2>
          <p className="text-gray-600 mb-4">
            Enable creator mode to unlock uploads, community posts, playlists, memberships, tips, and payout setup.
          </p>
          <button onClick={handleCreatorOnboarding} className="btn-primary">
            Enable creator mode
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiDollarSign className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Total earnings</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(creatorStats.totalEarnings)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiTrendingUp className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">This month</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(creatorStats.monthlyEarnings)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiGift className="w-5 h-5 text-pink-600 mb-2" />
          <p className="text-sm text-gray-600">Tips</p>
          <p className="text-2xl font-bold text-gray-900">{creatorStats.totalTips}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiUsers className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Active subscribers</p>
          <p className="text-2xl font-bold text-gray-900">{creatorStats.activeSubscribers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiEye className="w-5 h-5 text-indigo-600 mb-2" />
          <p className="text-sm text-gray-600">Total views</p>
          <p className="text-2xl font-bold text-gray-900">{formatCompact(analytics.totalViews)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCompact(analytics.averageViews)} avg per video</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiActivity className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm text-gray-600">Engagement rate</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.engagementRate.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">{analytics.sentimentScore.toFixed(0)}% positive reactions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiClock className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm text-gray-600">Watch time</p>
          <p className="text-2xl font-bold text-gray-900">{formatCompact(analytics.watchTimeHours)}h</p>
          <p className="text-xs text-gray-500 mt-1">{analytics.returningAudience}% returning audience</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiTarget className="w-5 h-5 text-rose-600 mb-2" />
          <p className="text-sm text-gray-600">Paid conversion</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(analytics.projectedMonthlyRevenue)} projected monthly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiDollarSign className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm text-gray-600">Ad revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(adLedger.creatorRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">90% creator share</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiEye className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Ad impressions</p>
          <p className="text-2xl font-bold text-gray-900">{formatCompact(adLedger.impressions)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCompact(adLedger.watchThroughs)} watch-throughs</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiMousePointer className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Ad clicks</p>
          <p className="text-2xl font-bold text-gray-900">{formatCompact(adLedger.clicks)}</p>
          <p className="text-xs text-gray-500 mt-1">Fraud-filtered events</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <FiClock className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm text-gray-600">Payable ads</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(adLedger.payableRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(adLedger.pendingRevenue)} pending review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Content Performance</h2>
              <p className="text-sm text-gray-600">Views, engagement, and estimated revenue by video.</p>
            </div>
            <FiBarChart2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.contentPerformance.map(video => (
              <div key={video.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{video.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatCompact(video.views)} views • {video.engagement.toFixed(2)}% engagement • {formatCurrency(video.revenue)} est. revenue
                    </p>
                  </div>
                  {(video.isPayPerView || video.isExclusive) && (
                    <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      Paid
                    </span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${video.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue Mix</h2>
          <p className="text-sm text-gray-600 mb-5">Estimated monthly contribution by product line.</p>
          <div className="space-y-4">
            {analytics.revenueStreams.map(stream => (
              <div key={stream.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{stream.label}</span>
                  <span className="text-gray-600">{formatCurrency(stream.amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${stream.tone}`} style={{ width: `${stream.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Top growth opportunity</p>
            <p className="mt-1 font-semibold text-gray-900">
              {analytics.fastestGrowingVideo?.title || 'Publish a new flagship video'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Audience Growth</h2>
          <p className="text-sm text-gray-600 mb-5">New subscribers over the last 7 days.</p>
          <div className="h-40 flex items-end gap-3">
            {analytics.audienceGrowth.map(day => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-32 flex items-end rounded bg-gray-50 overflow-hidden">
                  <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${day.height}%` }} />
                </div>
                <span className="text-xs text-gray-500">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Channel Snapshot</h2>
          <p className="text-sm text-gray-600 mb-5">Current audience and content base.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-600"><FiUsers /> Subscribers</span>
              <span className="font-semibold text-gray-900">{formatCompact(creatorChannel?.subscribers || user?.subscriberCount || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-600"><FiVideo /> Videos</span>
              <span className="font-semibold text-gray-900">{creatorVideos.length || creatorChannel?.videos || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-600"><FiStar /> Paid assets</span>
              <span className="font-semibold text-gray-900">
                {creatorVideos.filter(video => video.isExclusive || video.isPayPerView).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-600"><FiClock /> Live events</span>
              <span className="font-semibold text-gray-900">{creatorEvents.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Next Best Actions</h2>
          <p className="text-sm text-gray-600 mb-5">Prioritized recommendations from your analytics.</p>
          <div className="space-y-3">
            {analytics.insights.map((insight, index) => (
              <div key={insight} className="flex gap-3 rounded-lg bg-gray-50 p-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stripe Account</h2>
        <p className="text-sm text-gray-600 mb-4">
          Monetization is modeled around Stripe Connect onboarding, Checkout for one-time purchases, and Billing for memberships.
        </p>
        {stripeAccountId ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-green-700 font-medium">Connected to Stripe</span>
              <span className="text-sm text-gray-500">Account: {stripeAccountId}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Available balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(accountBalance?.available ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Pending balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(accountBalance?.pending ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                min="1"
                step="0.01"
                value={payoutAmount}
                onChange={(event) => setPayoutAmount(event.target.value)}
                placeholder="Payout amount"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePayout}
                disabled={isLoading || !payoutAmount}
                className="btn-primary disabled:bg-gray-400"
              >
                Request payout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">Connect your Stripe account to start earning.</p>
            <button
              onClick={handleCreateStripeAccount}
              disabled={isLoading}
              className="btn-primary disabled:bg-gray-400"
            >
              {isLoading ? 'Creating...' : 'Connect Stripe Account'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tip Menu</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tipAmounts.map((tip) => (
              <div key={tip.id} className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl">{tip.emoji}</div>
                <p className="font-semibold text-gray-900">{formatCurrency(tip.amount)}</p>
                <p className="text-xs text-gray-500">{tip.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Tiers</h3>
          <div className="space-y-3">
            {subscriptionTiers.map((tier) => (
              <div key={tier.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiStar className="w-4 h-4 text-purple-600" />
                    <p className="font-semibold text-gray-900">{tier.name}</p>
                  </div>
                  <p className="font-bold text-purple-700">{formatCurrency(tier.price)}/mo</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{tier.benefits.join(' • ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Creator Boosts</h3>
          <p className="text-sm text-gray-600 mb-4">
            Promote your channel or a flagship video with the starter package at {formatCurrency(CREATOR_BOOST_DAILY_PRICE)} per day.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="sm:col-span-1">
              <span className="block text-xs font-medium text-gray-500 mb-1">Days</span>
              <input
                type="number"
                min="1"
                max="30"
                value={boostDays}
                onChange={event => setBoostDays(Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Starter package</p>
              <p className="font-semibold text-gray-900">{formatCurrency(CREATOR_BOOST_DAILY_PRICE)}/day</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-semibold text-gray-900">{formatCurrency(boostDays * CREATOR_BOOST_DAILY_PRICE)}</p>
            </div>
          </div>
          <button onClick={handleCreatorBoost} disabled={isBoosting} className="btn-primary mt-4 disabled:bg-gray-400">
            {isBoosting ? 'Starting boost...' : 'Start boost'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Sponsorships</h3>
          <p className="text-sm text-gray-600 mb-4">
            Accept brand sponsorships through Amplifi. The creator keeps {(100 - DIRECT_SPONSORSHIP_PLATFORM_RATE * 100).toFixed(0)}% and Amplifi keeps {(DIRECT_SPONSORSHIP_PLATFORM_RATE * 100).toFixed(0)}% for billing, disclosure, and dispute support.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Example deal</p>
              <p className="font-semibold text-gray-900">{formatCurrency(1500)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Creator payout</p>
              <p className="font-semibold text-gray-900">{formatCurrency(1500 * (1 - DIRECT_SPONSORSHIP_PLATFORM_RATE))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
