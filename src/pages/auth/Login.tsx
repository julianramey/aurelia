import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, resendVerificationEmail } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const [authInProgress, setAuthInProgress] = useState(false);

  // Debug the URL parameters on mount
  useEffect(() => {
    console.log('Current location:', location);
    const searchParams = new URLSearchParams(location.search);
    const hasAuthParams = searchParams.has('access_token') || 
                          searchParams.has('refresh_token') || 
                          searchParams.has('provider') ||
                          searchParams.has('code');
    
    if (hasAuthParams) {
      console.log('Auth params detected in URL');
      setAuthInProgress(true);
    }
  }, [location]);

  // Debug auth state changes
  useEffect(() => {
    console.log('Auth state in Login component:', { user, session });
    
    if (user && !authInProgress) {
      console.log('User authenticated:', user.id);
      handleAuthSuccess();
    }
  }, [user, session, authInProgress]);

  const handleAuthSuccess = async () => {
    if (!user) return;

    try {
      // For email/password auth only
      if (user.app_metadata?.provider === 'email') {
        if (!user.email_confirmed_at) {
          setError('Please verify your email before continuing.');
          return;
        }
      }

      console.log('Checking user profile');
      // Check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile check result:', { profile, error: profileError });

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      if (!profile) {
        console.log('No profile found, redirecting to onboarding');
        navigate('/onboarding', { replace: true });
      } else {
        console.log('Profile found, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      // Don't block navigation on error, still try to proceed
      navigate('/dashboard', { replace: true });
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      const { error: resendError } = await resendVerificationEmail(user.email);
      if (resendError) throw resendError;
      setVerificationSent(true);
    } catch (err) {
      console.error('Error resending verification:', err);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-blush/20">
        <h1 className="text-3xl font-display font-medium text-center mb-2 text-charcoal">Welcome Back</h1>
        <p className="text-center text-taupe mb-8">Sign in to manage your portfolio</p>
        
        {error && (
          <div className="mb-4 p-4 text-rose bg-rose/5 rounded-lg border border-rose/10">
            {error}
            <button
              onClick={handleResendVerification}
              className="ml-2 underline text-rose hover:text-rose/80"
            >
              Resend verification email
            </button>
          </div>
        )}

        {verificationSent && (
          <div className="mb-4 p-4 text-green-700 bg-green-50 rounded-lg border border-green-100">
            Verification email sent! Please check your inbox.
          </div>
        )}

        {/* Only render Auth UI if not already processing a login */}
        {!authInProgress && !user && (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7E69AB',
                    brandAccent: '#6E59A5',
                    defaultButtonBackground: '#fff',
                    defaultButtonBackgroundHover: '#F5F5F5',
                    defaultButtonBorder: 'rgb(126, 105, 171, 0.2)',
                    defaultButtonText: '#1A1F2C',
                    anchorTextColor: '#7E69AB',
                    anchorTextHoverColor: '#6E59A5',
                  },
                  space: {
                    buttonPadding: '16px',
                    inputPadding: '16px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Inter', sans-serif`,
                    inputFontFamily: `'Inter', sans-serif`,
                    labelFontFamily: `'Inter', sans-serif`,
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                anchor: 'auth-link',
                divider: 'auth-divider',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password',
                  button_label: 'Create account',
                  loading_button_label: 'Creating account...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Don\'t have an account? Sign up',
                },
              },
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/login`}
            onlyThirdPartyProviders={false}
            magicLink={false}
          />
        )}
        
        {authInProgress && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Processing login...</p>
          </div>
        )}
      </div>
    </div>
  );
} 