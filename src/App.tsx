import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteLanguageProvider } from "@/hooks/useSiteLanguage";
import { useSiteTheme } from "@/hooks/useSiteTheme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedPage from "@/components/ProtectedPage";
import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import ServicePage from "@/pages/ServicePage";
import CategoryPage from "@/pages/CategoryPage";
import PackageDetailPage from "@/pages/PackageDetailPage";
import ContactPage from "@/pages/ContactPage";
import AboutPage from "@/pages/AboutPage";
import EventCalendarPage from "@/pages/EventCalendarPage";
import YashobhoomPage from "@/pages/YashobhoomPage";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import ManPowerPage from "@/pages/ManPowerPage";
import VenueDetailPage from "@/pages/VenueDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFound from "@/pages/not-found";
import PolicyPage from "@/pages/PolicyPage";

const queryClient = new QueryClient();

function Router() {
  useSiteTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />

          {/* Public services pages */}
          <Route path="/services" component={ServicesPage} />
          <Route path="/services/:serviceId" component={ServiceDetailPage} />

          {/* Service routes */}
          <Route path="/service" component={ServicePage} />
          <Route path="/service/:category" component={CategoryPage} />
          <Route path="/service/:category/:location" component={CategoryPage} />
          <Route path="/service/:category/:location/:option" component={CategoryPage} />

          {/* Package detail routes */}
          <Route path="/packages/:serviceId/:packageId" component={PackageDetailPage} />

          {/* Venue detail pages */}
          <Route path="/venue/:locationId/:subVenueId" component={VenueDetailPage} />

          {/* Exhibition Staff Services */}
          <Route path="/exhibition-staff" component={ManPowerPage} />
          <Route path="/exhibition-staff/:sub" component={ManPowerPage} />
          <Route path="/exhibition-staff/:sub/:child" component={ManPowerPage} />

          {/* Legacy manpower routes */}
          <Route path="/manpower" component={ManPowerPage} />
          <Route path="/manpower/:sub" component={ManPowerPage} />
          <Route path="/man-power" component={ManPowerPage} />
          <Route path="/apply-manpower" component={ManPowerPage} />
          <Route path="/apply-manpower/:sub" component={ManPowerPage} />

          {/* Event Calendar */}
          <Route path="/event-calendar" component={EventCalendarPage} />

          {/* Yashobhoomi */}
          <Route path="/yashobhoomi" component={YashobhoomPage} />

          {/* About */}
          <Route path="/about" component={AboutPage} />
          <Route path="/about/:sub" component={AboutPage} />

          {/* Contact */}
          <Route path="/contact">{() => <ProtectedPage><ContactPage /></ProtectedPage>}</Route>
          <Route path="/contact/form">{() => <ProtectedPage><ContactPage /></ProtectedPage>}</Route>
          <Route path="/privacy-policy">{() => <PolicyPage type="privacy" />}</Route>
          <Route path="/terms-of-service">{() => <PolicyPage type="terms" />}</Route>
          <Route path="/support">{() => <PolicyPage type="support" />}</Route>

          {/* Auth */}
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignUpPage} />
          <Route path="/admin-login" component={AdminLoginPage} />
          <Route path="/admin" component={AdminDashboardPage} />

          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SiteLanguageProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AuthProvider>
        </SiteLanguageProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
