import { useState, useEffect } from "react";
import { useUserSession } from "../hooks/useUserSession";
import LandingPage from "./components/LandingPage";
import ProfileSelection from "./components/ProfileSelection";
import InstallPage from "./components/InstallPage";
import LocalDashboard from "./components/LocalDashboard";
import BusinessDashboard from "./components/BusinessDashboard";
import EnterpriseDashboard from "./components/EnterpriseDashboard";
import PricingPage from "./components/PricingPage";
import ComponentLibrary from "./components/ComponentLibrary";
import CampaignManager from "./components/CampaignManager";
import RetailMediaCenter from "./components/RetailMediaCenter";
import TrustCenter from "./components/TrustCenter";
import BlockchainExplorer from "./components/BlockchainExplorer";
import NetworkMap from "./components/NetworkMap";
import AIRevenueCenter from "./components/AIRevenueCenter";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import BlockchainCenter from "./components/BlockchainCenter";
import AuditCenter from "./components/AuditCenter";
import MediaMarketplace from "./components/MediaMarketplace";
import ProgrammaticExchange from "./components/ProgrammaticExchange";
import AdvertiserCenter from "./components/AdvertiserCenter";
import AgencyCenter from "./components/AgencyCenter";
import DataIntelligenceCenter from "./components/DataIntelligenceCenter";
import ExecutiveCommandCenter from "./components/ExecutiveCommandCenter";
import InvestorDashboard from "./components/InvestorDashboard";
import TVScreenDesigner from "./components/TVScreenDesigner";
import OnboardingFlow from "./components/OnboardingFlow";
import PartnerPortal from "./components/PartnerPortal";
import ReportsCenter from "./components/ReportsCenter";
import PaymentPlans from "./components/PaymentPlans";
import ProofChainCenter from "./components/ProofChainCenter";
import ContentStudio from "./components/ContentStudio";
import InvestorDataRoom from "./components/InvestorDataRoom";
import DemandSidePlatform from "./components/DemandSidePlatform";
import AudienceIntelligence from "./components/AudienceIntelligence";
import UnicornRoadmap from "./components/UnicornRoadmap";
import LoginFlow from "./components/LoginFlow";
import AccessControl from "./components/AccessControl";
import FeatureGates from "./components/FeatureGates";
import ClientDashboard from "./components/ClientDashboard";
import AdvertiserCenter2 from "./components/AdvertiserCenter2";
import ScreenSetupWizard from "./components/ScreenSetupWizard";
import CampaignCreator from "./components/CampaignCreator";
import PublicProofVerifier from "./components/PublicProofVerifier";
import NotificationsCenter from "./components/NotificationsCenter";
import DeviceManager from "./components/DeviceManager";
import RevenueOptimizer from "./components/RevenueOptimizer";
import ContentCalendar from "./components/ContentCalendar";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import BillingCenter from "./components/BillingCenter";
import SupportCenter from "./components/SupportCenter";
import OnboardingChecklist from "./components/OnboardingChecklist";
import ReferralProgram from "./components/ReferralProgram";
import GoalsTracker from "./components/GoalsTracker";
import MarketplaceListings from "./components/MarketplaceListings";
import APICenter from "./components/APICenter";
import StatusPage from "./components/StatusPage";
import WhatsAppCenter from "./components/WhatsAppCenter";
import ReportExporter from "./components/ReportExporter";
import PlaylistManager from "./components/PlaylistManager";
import AdvertiserSelfServe from "./components/AdvertiserSelfServe";
import BrazilNetworkMap from "./components/BrazilNetworkMap";
import AIAssistant from "./components/AIAssistant";
import LeaderboardRanking from "./components/LeaderboardRanking";
import InventoryManager from "./components/InventoryManager";
import FranchiseManager from "./components/FranchiseManager";
import ContractManager from "./components/ContractManager";
import CreativeTemplates from "./components/CreativeTemplates";
import EventsCalendar from "./components/EventsCalendar";
import TaxCenter from "./components/TaxCenter";
import WhiteLabelPortal from "./components/WhiteLabelPortal";
import AudienceBuilder from "./components/AudienceBuilder";
import CompetitorBenchmark from "./components/CompetitorBenchmark";
import PlayerSimulator from "./components/PlayerSimulator";
import IntegrationsHub from "./components/IntegrationsHub";
import PayoutCenter from "./components/PayoutCenter";
import SecurityCenter from "./components/SecurityCenter";
import ChangelogPage from "./components/ChangelogPage";
import ROICalculator from "./components/ROICalculator";
import HelpCenter from "./components/HelpCenter";
import ScreenHealth from "./components/ScreenHealth";
import CampaignAnalytics from "./components/CampaignAnalytics";
import PublicDemo from "./components/PublicDemo";
import MediaKit from "./components/MediaKit";
import SLADashboard from "./components/SLADashboard";
import PartnerOnboarding from "./components/PartnerOnboarding";
import NotificationSettings from "./components/NotificationSettings";
import LiveMonitor from "./components/LiveMonitor";
import CampaignPlanner from "./components/CampaignPlanner";
import RevenueReport from "./components/RevenueReport";
import GrowthDashboard from "./components/GrowthDashboard";
import AdCreativeStudio from "./components/AdCreativeStudio";
import ScreenScheduler from "./components/ScreenScheduler";
import ClientPortal from "./components/ClientPortal";
import PlatformHealth from "./components/PlatformHealth";
import MapView from "./components/MapView";
import AdAuctionEngine from "./components/AdAuctionEngine";
import CPMOptimizer from "./components/CPMOptimizer";
import OnboardingTour from "./components/OnboardingTour";
import ABTestManager from "./components/ABTestManager";
import MultiTenantAdmin from "./components/MultiTenantAdmin";
import NFeCenter from "./components/NFeCenter";
import MobileDashboard from "./components/MobileDashboard";
import CampaignBriefing from "./components/CampaignBriefing";
import DigitalSignage from "./components/DigitalSignage";
import PartnerEarnings from "./components/PartnerEarnings";
import SystemSettings from "./components/SystemSettings";
import ContentLibrary from "./components/ContentLibrary";
import AudienceAnalytics from "./components/AudienceAnalytics";
import ProgrammaticBuying from "./components/ProgrammaticBuying";
import AlertCenter from "./components/AlertCenter";
import DataExport from "./components/DataExport";
import LeadCapture from "./components/LeadCapture";
import WeatherTrigger from "./components/WeatherTrigger";
import RetargetingEngine from "./components/RetargetingEngine";
import WhiteLabelAdmin from "./components/WhiteLabelAdmin";
import CreativeApproval from "./components/CreativeApproval";
import GeoFencing from "./components/GeoFencing";
import ReportBuilder from "./components/ReportBuilder";
import AdScheduler from "./components/AdScheduler";
import ComplianceCenter from "./components/ComplianceCenter";
import PerformanceBenchmark from "./components/PerformanceBenchmark";
import APIPlayground from "./components/APIPlayground";
import MediaPlan from "./components/MediaPlan";
import FraudDetection from "./components/FraudDetection";
import DynamicCreative from "./components/DynamicCreative";
import PublisherPortal from "./components/PublisherPortal";
import ProgrammaticDesk from "./components/ProgrammaticDesk";
import AudiencePlanner from "./components/AudiencePlanner";
import AttributionEngine from "./components/AttributionEngine";
import CreativeStudio from "./components/CreativeStudio";
import MarketplaceScreen from "./components/MarketplaceScreen";
import DataIntegration from "./components/DataIntegration";
import CampaignOptimizer from "./components/CampaignOptimizer";
import NotificationCenter from "./components/NotificationCenter";
import UserManagement from "./components/UserManagement";
import AnalyticsExplorer from "./components/AnalyticsExplorer";
import ProofOfPlay from "./components/ProofOfPlay";
import PricingCalculator from "./components/PricingCalculator";
import CustomerSuccess from "./components/CustomerSuccess";
import AICreativeLab from "./components/AICreativeLab";
import PixelTracking from "./components/PixelTracking";
import NetworkIntelligence from "./components/NetworkIntelligence";
import ESGDashboard from "./components/ESGDashboard";
import RevenueForecast from "./components/RevenueForecast";
import SmartBidding from "./components/SmartBidding";
import OOHPlanner from "./components/OOHPlanner";
import WhatsAppOTP from "./components/WhatsAppOTP";
import PitchDeck from "./components/PitchDeck";
import MobileAppShowcase from "./components/MobileAppShowcase";
import PublicAPIDoc from "./components/PublicAPIDoc";
import AICopilot from "./components/AICopilot";
import ScreenOnboarding from "./components/ScreenOnboarding";
import CertificateViewer from "./components/CertificateViewer";
import WhiteLabelPreview from "./components/WhiteLabelPreview";
import BrazilScreenMap from "./components/BrazilScreenMap";
import CampaignWizard from "./components/CampaignWizard";
import AdPreviewPlayer from "./components/AdPreviewPlayer";
import RealtimeDashboard from "./components/RealtimeDashboard";
import SoundControl from "./components/SoundControl";
import CommandPalette from "./components/CommandPalette";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import LiveTicker from "./components/LiveTicker";
import QuickActions from "./components/QuickActions";
import { soundEngine } from "./utils/SoundEngine";
import { Toaster } from "sonner";

type View =
  | "landing" | "profile" | "install" | "local" | "business" | "enterprise"
  | "pricing" | "components" | "campaign-manager" | "retail-media"
  | "trust-center" | "blockchain-explorer" | "network-map" | "ai-revenue"
  | "executive-dashboard" | "blockchain-center" | "audit-center"
  | "media-marketplace" | "programmatic-exchange" | "advertiser-center"
  | "agency-center" | "data-intelligence" | "executive-command"
  | "investor-dashboard" | "tv-designer"
  | "onboarding" | "partner-portal" | "reports-center"
  | "payment-plans" | "proofchain-center" | "content-studio"
  | "investor-dataroom" | "demand-side-platform" | "audience-intelligence" | "unicorn-roadmap"
  | "login" | "access-control" | "feature-gates" | "client-dashboard" | "advertiser-center2"
  | "screen-setup" | "campaign-creator"
  | "proof-verifier" | "notifications"
  | "device-manager" | "revenue-optimizer"
  | "content-calendar" | "analytics-dashboard"
  | "billing" | "support"
  | "onboarding-checklist" | "referral"
  | "goals" | "marketplace"
  | "api-center" | "status"
  | "whatsapp" | "report-exporter"
  | "playlist" | "advertiser-self-serve"
  | "network-map2" | "ai-assistant"
  | "leaderboard" | "inventory"
  | "franchise" | "contracts"
  | "creative-templates" | "events-calendar"
  | "tax-center" | "white-label"
  | "audience-builder" | "benchmark" | "player" | "integrations"
  | "payouts" | "security" | "changelog" | "roi-calculator"
  | "help-center" | "screen-health" | "campaign-analytics" | "public-demo"
  | "media-kit" | "sla-dashboard" | "partner-onboarding" | "notification-settings"
  | "live-monitor" | "campaign-planner" | "revenue-report" | "growth-dashboard"
  | "ad-creative" | "screen-scheduler" | "client-portal" | "platform-health"
  | "map-view" | "ad-auction" | "cpm-optimizer" | "onboarding-tour"
  | "ab-test" | "multi-tenant" | "nfe-center" | "mobile-dashboard"
  | "campaign-briefing" | "digital-signage" | "partner-earnings" | "system-settings"
  | "content-library" | "audience-analytics" | "programmatic-buying" | "contract-manager"
  | "alert-center" | "data-export" | "billing-center" | "support-center"
  | "lead-capture" | "weather-trigger" | "retargeting-engine" | "white-label-admin"
  | "inventory-manager" | "creative-approval" | "geo-fencing" | "report-builder"
  | "ad-scheduler" | "compliance-center" | "performance-benchmark" | "api-playground"
  | "media-plan" | "fraud-detection" | "dynamic-creative" | "publisher-portal"
  | "programmatic-desk" | "audience-planner" | "attribution-engine" | "creative-studio"
  | "marketplace-screen" | "data-integration" | "campaign-optimizer" | "notification-center"
  | "user-management" | "analytics-explorer" | "proof-of-play" | "pricing-calculator"
  | "brazil-map" | "campaign-wizard" | "ad-preview" | "realtime-dashboard"
  | "ai-copilot" | "screen-onboarding" | "certificate-viewer" | "white-label-preview"
  | "whatsapp-otp" | "pitch-deck" | "mobile-showcase" | "api-docs"
  | "esg-dashboard" | "revenue-forecast" | "smart-bidding" | "ooh-planner"
  | "customer-success" | "ai-creative-lab" | "pixel-tracking" | "network-intelligence";

export default function App() {
  const [view, setViewRaw] = useState<View>("landing");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const userSession = useUserSession();

  const setView = (v: View) => { soundEngine.play("navigate"); setViewRaw(v); };
  const goBack = () => setView("landing");
  const goEnterprise = () => setView("enterprise");
  const handleSelect = (tier: string) => setView(tier as View);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      if (!isInput && e.key === "?") { setShortcutsOpen(o => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        const next = !soundEngine.enabled;
        soundEngine.setEnabled(next);
        if (next) soundEngine.play("toggle");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleEnterpriseNavigate = (target: string) => {
    const views: View[] = ["campaign-manager","retail-media","trust-center","blockchain-explorer","network-map","ai-revenue","executive-dashboard","blockchain-center","audit-center","media-marketplace","programmatic-exchange","advertiser-center","agency-center","data-intelligence","executive-command","investor-dashboard","tv-designer","onboarding","partner-portal","reports-center","payment-plans","proofchain-center","content-studio","investor-dataroom","demand-side-platform","audience-intelligence","unicorn-roadmap","login","access-control","feature-gates","client-dashboard","advertiser-center2","screen-setup","campaign-creator","proof-verifier","notifications","device-manager","revenue-optimizer","content-calendar","analytics-dashboard","billing","support","onboarding-checklist","referral","goals","marketplace","api-center","status","whatsapp","report-exporter","playlist","advertiser-self-serve","network-map2","ai-assistant","leaderboard","inventory","franchise","contracts","creative-templates","events-calendar","tax-center","white-label","audience-builder","benchmark","player","integrations","payouts","security","changelog","roi-calculator","help-center","screen-health","campaign-analytics","public-demo","media-kit","sla-dashboard","partner-onboarding","notification-settings"];
    if (views.includes(target as View)) setView(target as View);
  };

  const handleLogin = async (profile: string, plan: string, data?: { phone: string; name: string; businessType?: string }) => {
    if (data) await userSession.login({ phone: data.phone, name: data.name, profile, plan, businessType: data.businessType });
    if (profile === "owner") setView("client-dashboard");
    else goEnterprise();
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", width: "100%", paddingBottom: "32px" }}>
      {view === "landing" && <LandingPage onSelect={(v) => setView(v as View)} />}
      {view === "profile" && <ProfileSelection onSelect={handleSelect} />}
      {view === "install" && <InstallPage onBack={goBack} />}
      {view === "local" && <LocalDashboard onBack={goBack} />}
      {view === "business" && <BusinessDashboard onBack={goBack} />}
      {view === "enterprise" && <EnterpriseDashboard onBack={goBack} onNavigate={handleEnterpriseNavigate} userSession={userSession.session} screens={userSession.screens} aiQuota={userSession.aiQuota} onLogout={userSession.logout} />}
      {view === "pricing" && <PricingPage onBack={goBack} onSelect={(tier) => setView(tier as View)} />}
      {view === "components" && <ComponentLibrary onBack={goBack} />}
      {view === "campaign-manager" && <CampaignManager onBack={goEnterprise} />}
      {view === "retail-media" && <RetailMediaCenter onBack={goEnterprise} />}
      {view === "trust-center" && <TrustCenter onBack={goEnterprise} />}
      {view === "blockchain-explorer" && <BlockchainExplorer onBack={goEnterprise} />}
      {view === "network-map" && <NetworkMap onBack={goEnterprise} />}
      {view === "ai-revenue" && <AIRevenueCenter onBack={goEnterprise} />}
      {view === "executive-dashboard" && <ExecutiveDashboard onBack={goEnterprise} />}
      {view === "blockchain-center" && <BlockchainCenter onBack={goEnterprise} />}
      {view === "audit-center" && <AuditCenter onBack={goEnterprise} />}
      {view === "media-marketplace" && <MediaMarketplace onBack={goBack} />}
      {view === "programmatic-exchange" && <ProgrammaticExchange onBack={goBack} />}
      {view === "advertiser-center" && <AdvertiserCenter onBack={goBack} />}
      {view === "agency-center" && <AgencyCenter onBack={goBack} />}
      {view === "data-intelligence" && <DataIntelligenceCenter onBack={goBack} />}
      {view === "executive-command" && <ExecutiveCommandCenter onBack={goBack} />}
      {view === "investor-dashboard" && <InvestorDashboard onBack={goBack} />}
      {view === "tv-designer" && <TVScreenDesigner onBack={goBack} />}
      {view === "onboarding" && <OnboardingFlow onBack={goEnterprise} />}
      {view === "partner-portal" && <PartnerPortal onBack={goEnterprise} />}
      {view === "reports-center" && <ReportsCenter onBack={goEnterprise} />}
      {view === "payment-plans" && <PaymentPlans onBack={goEnterprise} />}
      {view === "proofchain-center" && <ProofChainCenter onBack={goEnterprise} />}
      {view === "content-studio" && <ContentStudio onBack={goEnterprise} />}
      {view === "investor-dataroom" && <InvestorDataRoom onBack={goEnterprise} />}
      {view === "demand-side-platform" && <DemandSidePlatform onBack={goEnterprise} />}
      {view === "audience-intelligence" && <AudienceIntelligence onBack={goEnterprise} />}
      {view === "unicorn-roadmap" && <UnicornRoadmap onBack={goEnterprise} />}
      {view === "login" && <LoginFlow onBack={goBack} onLogin={(profile, plan, data) => handleLogin(profile, plan, data)} />}
      {view === "access-control" && <AccessControl onBack={goEnterprise} />}
      {view === "feature-gates" && <FeatureGates onBack={goEnterprise} userPlan={userSession.session?.plan ?? "starter"} onUpgrade={userSession.upgradePlan} />}
      {view === "advertiser-center2" && <AdvertiserCenter2 onBack={goEnterprise} />}
      {view === "screen-setup" && <ScreenSetupWizard onBack={goBack} session={userSession.session} onComplete={() => setView("client-dashboard")} />}
      {view === "campaign-creator" && <CampaignCreator onBack={goEnterprise} />}
      {view === "proof-verifier" && <PublicProofVerifier onBack={goBack} />}
      {view === "notifications" && <NotificationsCenter onBack={goBack} />}
      {view === "device-manager" && <DeviceManager onBack={goEnterprise} />}
      {view === "revenue-optimizer" && <RevenueOptimizer onBack={goEnterprise} />}
      {view === "content-calendar" && <ContentCalendar onBack={goEnterprise} />}
      {view === "analytics-dashboard" && <AnalyticsDashboard onBack={goEnterprise} />}
      {view === "billing" && <BillingCenter onBack={goEnterprise} session={userSession.session} />}
      {view === "support" && <SupportCenter onBack={goEnterprise} />}
      {view === "onboarding-checklist" && <OnboardingChecklist onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "referral" && <ReferralProgram onBack={goEnterprise} onNavigate={(v) => setView(v as any)} session={userSession.session} />}
      {view === "goals" && <GoalsTracker onBack={goEnterprise} onNavigate={(v) => setView(v as any)} session={userSession.session} />}
      {view === "marketplace" && <MarketplaceListings onBack={goEnterprise} onNavigate={(v) => setView(v as any)} session={userSession.session} />}
      {view === "api-center" && <APICenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "status" && <StatusPage onBack={goEnterprise} />}
      {view === "whatsapp" && <WhatsAppCenter onBack={goEnterprise} session={userSession.session} />}
      {view === "report-exporter" && <ReportExporter onBack={goEnterprise} session={userSession.session} />}
      {view === "playlist" && <PlaylistManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "advertiser-self-serve" && <AdvertiserSelfServe onBack={goBack} onNavigate={(v) => setView(v as any)} />}
      {view === "network-map2" && <BrazilNetworkMap onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ai-assistant" && <AIAssistant onBack={goEnterprise} onNavigate={(v) => setView(v as any)} session={userSession.session} />}
      {view === "leaderboard" && <LeaderboardRanking onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "inventory" && <InventoryManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "franchise" && <FranchiseManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "contracts" && <ContractManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "creative-templates" && <CreativeTemplates onBack={goEnterprise} onNavigate={(v) => setView(v as any)} plan={userSession.session?.plan ?? "pro"} />}
      {view === "events-calendar" && <EventsCalendar onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "tax-center" && <TaxCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "white-label" && <WhiteLabelPortal onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "audience-builder" && <AudienceBuilder onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "benchmark" && <CompetitorBenchmark onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "player" && <PlayerSimulator onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "integrations" && <IntegrationsHub onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "payouts" && <PayoutCenter onBack={goEnterprise} />}
      {view === "security" && <SecurityCenter onBack={goEnterprise} />}
      {view === "changelog" && <ChangelogPage onBack={goEnterprise} />}
      {view === "roi-calculator" && <ROICalculator onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "help-center" && <HelpCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "screen-health" && <ScreenHealth onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "campaign-analytics" && <CampaignAnalytics onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "public-demo" && <PublicDemo onNavigate={(v) => setView(v as any)} />}
      {view === "media-kit" && <MediaKit onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "sla-dashboard" && <SLADashboard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "partner-onboarding" && <PartnerOnboarding onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "notification-settings" && <NotificationSettings onBack={goEnterprise} />}
      {view === "live-monitor" && <LiveMonitor onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "campaign-planner" && <CampaignPlanner onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "revenue-report" && <RevenueReport onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "growth-dashboard" && <GrowthDashboard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ad-creative" && <AdCreativeStudio onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "screen-scheduler" && <ScreenScheduler onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "client-portal" && <ClientPortal onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "platform-health" && <PlatformHealth onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "map-view" && <MapView onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ad-auction" && <AdAuctionEngine onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "cpm-optimizer" && <CPMOptimizer onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "onboarding-tour" && <OnboardingTour onComplete={goEnterprise} onSkip={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ab-test" && <ABTestManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "multi-tenant" && <MultiTenantAdmin onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "nfe-center" && <NFeCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "mobile-dashboard" && <MobileDashboard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "campaign-briefing" && <CampaignBriefing onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "digital-signage" && <DigitalSignage onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "partner-earnings" && <PartnerEarnings onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "system-settings" && <SystemSettings onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "content-library" && <ContentLibrary onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "audience-analytics" && <AudienceAnalytics onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "programmatic-buying" && <ProgrammaticBuying onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "contract-manager" && <ContractManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "alert-center" && <AlertCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "data-export" && <DataExport onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "billing-center" && <BillingCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "support-center" && <SupportCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "lead-capture" && <LeadCapture onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "weather-trigger" && <WeatherTrigger onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "retargeting-engine" && <RetargetingEngine onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "white-label-admin" && <WhiteLabelAdmin onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "inventory-manager" && <InventoryManager onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "creative-approval" && <CreativeApproval onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "geo-fencing" && <GeoFencing onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "report-builder" && <ReportBuilder onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ad-scheduler" && <AdScheduler onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "compliance-center" && <ComplianceCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "performance-benchmark" && <PerformanceBenchmark onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "api-playground" && <APIPlayground onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "media-plan" && <MediaPlan onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "fraud-detection" && <FraudDetection onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "dynamic-creative" && <DynamicCreative onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "publisher-portal" && <PublisherPortal onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "programmatic-desk" && <ProgrammaticDesk onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "audience-planner" && <AudiencePlanner onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "attribution-engine" && <AttributionEngine onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "creative-studio" && <CreativeStudio onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "marketplace-screen" && <MarketplaceScreen onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "data-integration" && <DataIntegration onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "campaign-optimizer" && <CampaignOptimizer onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "notification-center" && <NotificationCenter onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "user-management" && <UserManagement onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "analytics-explorer" && <AnalyticsExplorer onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "proof-of-play" && <ProofOfPlay onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "pricing-calculator" && <PricingCalculator onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "brazil-map" && <BrazilScreenMap onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "campaign-wizard" && <CampaignWizard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ad-preview" && <AdPreviewPlayer onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "realtime-dashboard" && <RealtimeDashboard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ai-copilot" && <AICopilot onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "screen-onboarding" && <ScreenOnboarding onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "certificate-viewer" && <CertificateViewer onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "white-label-preview" && <WhiteLabelPreview onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "whatsapp-otp" && <WhatsAppOTP onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "pitch-deck" && <PitchDeck onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "mobile-showcase" && <MobileAppShowcase onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "api-docs" && <PublicAPIDoc onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "esg-dashboard" && <ESGDashboard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "revenue-forecast" && <RevenueForecast onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "smart-bidding" && <SmartBidding onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ooh-planner" && <OOHPlanner onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "customer-success" && <CustomerSuccess onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "ai-creative-lab" && <AICreativeLab onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "pixel-tracking" && <PixelTracking onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "network-intelligence" && <NetworkIntelligence onBack={goEnterprise} onNavigate={(v) => setView(v as any)} />}
      {view === "client-dashboard" && <ClientDashboard onBack={goEnterprise} onNavigate={(v) => setView(v as any)} session={userSession.session} screens={userSession.screens} aiQuota={userSession.aiQuota} onUpgrade={(plan) => { userSession.upgradePlan(plan); }} />}
      <SoundControl />
      <QuickActions onNavigate={(v) => setView(v as any)} />
      <LiveTicker />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={(v) => setView(v as any)} />
      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <Toaster position="top-right" toastOptions={{ style: { background: "#0F1120", border: "1px solid #1A1D35", color: "#ECF0FF" }, duration: 3500 }} />
    </div>
  );
}
