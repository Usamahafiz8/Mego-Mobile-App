import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const translations = {
  en: {
    // Settings
    settings_title: "Settings",
    settings_subtitle: "Manage your preferences",
    settings_preferences: "Preferences",
    settings_dark_mode: "Dark Mode",
    settings_dark_mode_desc: "Enable dark theme",
    settings_notifications: "Push Notifications",
    settings_notifications_desc: "Receive app notifications",
    settings_account: "Account",
    settings_change_password: "Change Password",
    settings_privacy: "Privacy Settings",
    settings_language: "Language",
    settings_language_subtitle: "Choose your preferred language",
    language_loading: "Loading language preferences…",
    language_save: "Save Language",
    language_updated: "Language updated successfully!",
    language_saved_local: "Language preference saved locally!",
    
    // Privacy
    privacy_title: "Privacy Settings",
    privacy_subtitle: "Control your visibility",
    privacy_hide_profile: "Hide My Profile",
    privacy_hide_profile_desc: "Make your profile invisible to other users",
    privacy_allow_messages: "Allow Messages",
    privacy_allow_messages_desc: "Let others send you messages",
    privacy_loading: "Loading privacy preferences…",
    privacy_save: "Save Changes",
    
    // Language Options
    language_option_english: "English",
    language_option_urdu: "Urdu",
    language_option_arabic: "Arabic",
    
    // Splash Screen
    splash_app_name: "MeGo",
    splash_tagline: "Buy • Sell • Connect",
    splash_subtagline: "Your Smart Marketplace",
    
    // Onboarding
    onboarding_slide1_title: "Buy & Sell with Confidence",
    onboarding_slide1_desc: "Verified users, AI spam filters, escrow-safe chats. Your city's most trusted marketplace.",
    onboarding_slide2_title: "Post Ads in 60 Seconds",
    onboarding_slide2_desc: "Smart wizard, auto quality score, voice descriptions & instant boosts for max reach.",
    onboarding_slide3_title: "Earn While You Trade",
    onboarding_slide3_desc: "Loyalty coins, referrals, spin wheels and mini-games reward every action.",
    onboarding_next: "Next",
    onboarding_get_started: "Experience MEGO",
    
    // Login
    login_welcome: "Welcome back!",
    login_subtitle: "Login to continue selling smarter",
    login_phone: "Phone Number",
    login_password: "Password",
    login_button: "Login",
    login_logging: "Logging in...",
    login_or: "OR",
    login_google: "Google",
    login_facebook: "Facebook",
    login_no_account: "Need an account?",
    login_signup: "Sign up",
    
    // Signup
    signup_title: "Join MeGo",
    signup_subtitle: "Your Smart Marketplace",
    signup_desc: "Post ads, earn rewards, and connect with verified buyers & sellers",
    signup_name: "Full Name",
    signup_phone: "Phone Number",
    signup_email: "Email",
    signup_password: "Password",
    signup_confirm_password: "Confirm Password",
    signup_button: "Sign Up",
    signup_creating: "Creating account...",
    signup_have_account: "Already have an account?",
    signup_login: "Login",
    
    // Common
    common_save: "Save",
    common_cancel: "Cancel",
    common_continue: "Continue",
    common_back: "Back",
    common_next: "Next",
    common_submit: "Submit",
    common_loading: "Loading...",
    common_error: "Error",
    common_success: "Success",
    common_ok: "OK",
    
    // Dashboard
    dashboard_search: "Search...",
    dashboard_all: "All",
    dashboard_mobiles: "Mobiles",
    dashboard_cars: "Cars",
    dashboard_property: "Property",
    dashboard_electronics: "Electronics",
    dashboard_furniture: "Furniture",
    dashboard_jobs: "Jobs",
    dashboard_services: "Services",
    dashboard_location: "Location",
    dashboard_contact: "Contact",
    dashboard_new: "NEW",
    dashboard_boost: "BOOST",
    dashboard_sort: "Sort",
    dashboard_sort_asc: "Price: Low to High",
    dashboard_sort_desc: "Price: High to Low",
    dashboard_no_ads: "No ads found",
    dashboard_chat_error: "Unable to start chat.",
    
    // Ad Detail
    ad_detail_share: "Share",
    ad_detail_report: "Report",
    ad_detail_favorite: "Favorite",
    ad_detail_contact_seller: "Contact Seller",
    ad_detail_chat_seller: "Chat with Seller",
    ad_detail_call_seller: "Call Seller",
    ad_detail_price: "Price",
    ad_detail_description: "Description",
    ad_detail_seller_info: "Seller Information",
    ad_detail_similar_ads: "Similar Ads",
    ad_detail_swap_request: "Swap Request",
    ad_detail_boost: "Boost",
    ad_detail_play_voice: "Play Voice Description",
    ad_detail_stop_voice: "Stop Voice",
    ad_detail_error_load: "Unable to load ad details.",
    ad_detail_error_share: "Unable to share the ad.",
    ad_detail_error_favorite: "Failed to update favorite",
    ad_detail_error_voice: "Failed to play voice description",
    ad_detail_error_boost: "Failed to generate boost link",
    ad_detail_error_seller: "Seller info not found",
    ad_detail_error_chat: "Failed to start chat with seller.",
    ad_detail_login_required: "Login Required",
    ad_detail_login_message: "Please login to send swap requests",
    ad_detail_cannot_swap: "Cannot Swap",
    ad_detail_cannot_swap_own: "You cannot send a swap request for your own ad",
    ad_detail_no_active_ads: "No Active Ads",
    ad_detail_no_active_ads_message: "You don't have any active ads. Please create and get an ad approved first.",
    ad_detail_only_one_ad: "You only have 1 active ad, and you cannot swap an ad with itself. Please create another active ad first.",
    ad_detail_no_available_ads: "No Available Ads",
    ad_detail_select_ad: "Please select an ad to swap",
    ad_detail_swap_success: "Swap request sent successfully!",
    ad_detail_swap_error: "Failed to create swap request",
    ad_detail_report_reason: "Please enter a reason.",
    ad_detail_report_success: "Your report has been submitted successfully.",
    ad_detail_report_error: "Failed to submit report",
    ad_detail_report_title: "Report Ad",
    ad_detail_report_placeholder: "Enter reason for reporting...",
    ad_detail_swap_title: "Select Your Ad to Swap",
    ad_detail_swap_message: "Message (optional)",
    ad_detail_swap_placeholder: "Add a message for the seller...",
    ad_detail_share_message: "Check out this ad on MEGO:",
    ad_detail_boost_share_message: "Check out this ad:\n\nShare with 3 friends to get free boost!",
    
    // Post Ad
    post_ad_basic_info: "Basic Info",
    post_ad_details: "Details",
    post_ad_media_contact: "Media & Contact",
    post_ad_category: "Category",
    post_ad_select_category: "Select Category",
    post_ad_type: "Ad Type",
    post_ad_select_type: "Select Type",
    post_ad_condition: "Condition",
    post_ad_select_condition: "Select Condition",
    post_ad_title: "Title",
    post_ad_title_placeholder: "Enter ad title",
    post_ad_price: "Price",
    post_ad_price_placeholder: "Enter price",
    post_ad_negotiable: "Negotiable",
    post_ad_description: "Description",
    post_ad_description_placeholder: "Describe your item...",
    post_ad_location: "Location",
    post_ad_location_placeholder: "Enter location",
    post_ad_contact: "Contact",
    post_ad_contact_placeholder: "Phone number",
    post_ad_images: "Images",
    post_ad_add_images: "Add Images",
    post_ad_voice_description: "Voice Description",
    post_ad_record_voice: "Record Voice",
    post_ad_stop_recording: "Stop Recording",
    post_ad_required_fields: "⚠️ Required Fields",
    post_ad_fill_all: "Please fill all required fields",
    post_ad_success: "Ad posted successfully! You earned 25 points.",
    post_ad_error: "Unexpected response from server",
    post_ad_upload_failed: "Upload Failed",
    post_ad_failed: "Failed to post ad",
    post_ad_sell: "Sell",
    post_ad_rent: "Rent",
    post_ad_exchange: "Exchange",
    post_ad_new: "New",
    post_ad_used: "Used",
    
    // Profile & Other
    profile_title: "Profile",
    profile_edit: "Edit Profile",
    profile_logout: "Logout",
    profile_update_success: "Profile picture updated!",
    profile_update_error: "Could not update profile picture.",
    profile_loading: "Loading profile...",
    
    my_ads_title: "My Ads",
    my_ads_active: "Active",
    my_ads_pending: "Pending",
    my_ads_sold: "Sold",
    my_ads_rejected: "Rejected",
    my_ads_delete: "Delete Ad",
    my_ads_delete_confirm: "Are you sure?",
    my_ads_delete_success: "Ad deleted successfully",
    my_ads_delete_error: "Delete failed",
    my_ads_mark_sold: "Mark as Sold",
    my_ads_mark_sold_success: "Ad marked as sold",
    my_ads_mark_sold_error: "Failed to mark as sold",
    my_ads_load_error: "Could not load ads",
    my_ads_no_ads: "No ads found",
    
    favorites_title: "Favorites",
    favorites_empty: "No favorites yet",
    favorites_empty_desc: "Start saving ads you like!",
    favorites_remove: "Remove from favorites",
    favorites_load_error: "Failed to load favorites",
    favorites_remove_error: "Failed to remove favorite",
    
    notifications_title: "Notifications",
    notifications_empty: "No notifications",
    notifications_mark_read: "Mark as read",
    notifications_delete: "Delete Notification",
    notifications_delete_confirm: "Are you sure you want to delete this?",
    notifications_delete_success: "Deleted successfully",
    notifications_delete_error: "Failed to delete",
    notifications_load_error: "Failed to load notifications",
    notifications_new: "New Notification",
    notifications_new_update: "You got a new update!",
    
    help_title: "Help & Support",
    help_subtitle: "Get assistance anytime",
    help_faq: "Frequently Asked Questions",
    help_contact: "Contact Support",
    help_message_placeholder: "Describe your issue...",
    help_send: "Send Message",
    help_sending: "Sending...",
    help_success: "Your support request has been sent!",
    help_error: "Failed to send message",
    help_message_required: "Please enter a message",
    help_attach_image: "Attach Screenshot",
    help_faq_1_q: "How can I post an ad?",
    help_faq_1_a: "Go to Dashboard → Post Ad → Fill details and upload image.",
    help_faq_2_q: "How can I reset my password?",
    help_faq_2_a: "Go to Settings → Change Password → Enter new password.",
    help_faq_3_q: "How to enable dark mode?",
    help_faq_3_a: "Go to Settings → Turn on Dark Mode toggle.",
    help_faq_4_q: "How can I edit my profile?",
    help_faq_4_a: "Go to Profile → Tap your name or image to update.",
    
    referral_title: "Invite & Earn",
    referral_subtitle: "Share and get rewarded",
    referral_code: "Your Referral Code",
    referral_copy: "Copy",
    referral_share: "Share",
    referral_loading: "Loading...",
    
    // Chat
    chat_send: "Send",
    chat_placeholder: "Type a message...",
    chat_empty: "No messages yet",
    chat_loading: "Loading messages...",
    
    // Wallet
    wallet_title: "Wallet",
    wallet_balance: "Balance",
    wallet_points: "Points",
    wallet_history: "Transaction History",
    
    // Change Password
    change_password_title: "Change Password",
    change_password_current: "Current Password",
    change_password_new: "New Password",
    change_password_confirm: "Confirm New Password",
    change_password_success: "Password changed successfully!",
    change_password_error: "Failed to change password",
    
    // Forgot Password
    forgot_password_title: "Forgot Password",
    forgot_password_subtitle: "Enter your phone number to reset password",
    forgot_password_send: "Send OTP",
    forgot_password_sending: "Sending OTP...",
    
    // OTP
    otp_title: "Verify OTP",
    otp_subtitle: "Enter the code sent to your phone",
    otp_verify: "Verify",
    otp_verifying: "Verifying...",
    otp_resend: "Resend OTP",
    otp_invalid: "Invalid OTP",
  },
  ur: {
    // Settings
    settings_title: "سیٹنگز",
    settings_subtitle: "اپنی ترجیحات مینج کریں",
    settings_preferences: "ترجیحات",
    settings_dark_mode: "ڈارک موڈ",
    settings_dark_mode_desc: "ڈارک تھیم فعال کریں",
    settings_notifications: "پش نوٹیفیکیشنز",
    settings_notifications_desc: "ایپ نوٹیفیکیشنز حاصل کریں",
    settings_account: "اکاؤنٹ",
    settings_change_password: "پاس ورڈ تبدیل کریں",
    settings_privacy: "پرائیویسی",
    settings_language: "زبان",
    settings_language_subtitle: "اپنی پسندیدہ زبان منتخب کریں",
    language_loading: "زبان کی ترجیحات لوڈ ہو رہی ہیں…",
    language_save: "زبان محفوظ کریں",
    language_updated: "زبان کامیابی سے اپ ڈیٹ ہو گئی!",
    language_saved_local: "زبان کی ترجیح مقامی طور پر محفوظ ہو گئی!",
    
    // Privacy
    privacy_title: "پرائیویسی سیٹنگز",
    privacy_subtitle: "اپنی مرئیت کنٹرول کریں",
    privacy_hide_profile: "میری پروفائل چھپائیں",
    privacy_hide_profile_desc: "اپنی پروفائل دوسرے صارفین سے پوشیدہ رکھیں",
    privacy_allow_messages: "پیغامات کی اجازت دیں",
    privacy_allow_messages_desc: "دوسروں کو آپ کو پیغام بھیجنے دیں",
    privacy_loading: "پرائیویسی کی ترجیحات لوڈ ہو رہی ہیں…",
    privacy_save: "محفوظ کریں",
    
    // Language Options
    language_option_english: "انگریزی",
    language_option_urdu: "اردو",
    language_option_arabic: "عربی",
    
    // Splash Screen
    splash_app_name: "میگو",
    splash_tagline: "خریدیں • بیچیں • جڑیں",
    splash_subtagline: "آپ کا سمارٹ مارکیٹ پلیس",
    
    // Onboarding
    onboarding_slide1_title: "اعتماد کے ساتھ خریدیں اور بیچیں",
    onboarding_slide1_desc: "تصدیق شدہ صارفین، AI اسپیم فلٹرز، محفوظ چیٹس۔ آپ کے شہر کا سب سے قابل اعتماد مارکیٹ پلیس۔",
    onboarding_slide2_title: "60 سیکنڈ میں اشتہار پوسٹ کریں",
    onboarding_slide2_desc: "ذہین ویزارڈ، خودکار کوالٹی اسکور، آواز کی تفصیلات اور زیادہ سے زیادہ پہنچ کے لیے فوری بوسٹ۔",
    onboarding_slide3_title: "تجارت کرتے ہوئے کمائیں",
    onboarding_slide3_desc: "وفاداری کے سکے، حوالہ جات، سپن وہیل اور منی گیمز ہر عمل پر انعام دیتے ہیں۔",
    onboarding_next: "اگلا",
    onboarding_get_started: "میگو کا تجربہ کریں",
    
    // Login
    login_welcome: "خوش آمدید!",
    login_subtitle: "ذہین بیچنے کے لیے لاگ ان کریں",
    login_phone: "فون نمبر",
    login_password: "پاس ورڈ",
    login_button: "لاگ ان",
    login_logging: "لاگ ان ہو رہا ہے...",
    login_or: "یا",
    login_google: "گوگل",
    login_facebook: "فیس بک",
    login_no_account: "اکاؤنٹ کی ضرورت ہے؟",
    login_signup: "سائن اپ",
    
    // Signup
    signup_title: "میگو میں شامل ہوں",
    signup_subtitle: "آپ کا سمارٹ مارکیٹ پلیس",
    signup_desc: "اشتہارات پوسٹ کریں، انعامات کمائیں، اور تصدیق شدہ خریداروں اور فروخت کنندگان سے جڑیں",
    signup_name: "پورا نام",
    signup_phone: "فون نمبر",
    signup_email: "ای میل",
    signup_password: "پاس ورڈ",
    signup_confirm_password: "پاس ورڈ کی تصدیق",
    signup_button: "سائن اپ",
    signup_creating: "اکاؤنٹ بنایا جا رہا ہے...",
    signup_have_account: "پہلے سے اکاؤنٹ ہے؟",
    signup_login: "لاگ ان",
    
    // Common
    common_save: "محفوظ کریں",
    common_cancel: "منسوخ کریں",
    common_continue: "جاری رکھیں",
    common_back: "واپس",
    common_next: "اگلا",
    common_submit: "جمع کریں",
    common_loading: "لوڈ ہو رہا ہے...",
    common_error: "خرابی",
    common_success: "کامیابی",
    common_ok: "ٹھیک ہے",
    
    // Dashboard
    dashboard_search: "تلاش کریں...",
    dashboard_all: "سب",
    dashboard_mobiles: "موبائلز",
    dashboard_cars: "گاڑیاں",
    dashboard_property: "جائیداد",
    dashboard_electronics: "الیکٹرانکس",
    dashboard_furniture: "فرنیچر",
    dashboard_jobs: "نوکریاں",
    dashboard_services: "سروسز",
    dashboard_location: "مقام",
    dashboard_contact: "رابطہ",
    dashboard_new: "نیا",
    dashboard_boost: "بوسٹ",
    dashboard_sort: "ترتیب",
    dashboard_sort_asc: "قیمت: کم سے زیادہ",
    dashboard_sort_desc: "قیمت: زیادہ سے کم",
    dashboard_no_ads: "کوئی اشتہار نہیں ملا",
    dashboard_chat_error: "چیٹ شروع نہیں ہو سکی۔",
    
    // Ad Detail
    ad_detail_share: "شیئر کریں",
    ad_detail_report: "رپورٹ کریں",
    ad_detail_favorite: "پسندیدہ",
    ad_detail_contact_seller: "فروخت کنندہ سے رابطہ",
    ad_detail_chat_seller: "فروخت کنندہ سے بات کریں",
    ad_detail_call_seller: "فروخت کنندہ کو کال کریں",
    ad_detail_price: "قیمت",
    ad_detail_description: "تفصیل",
    ad_detail_seller_info: "فروخت کنندہ کی معلومات",
    ad_detail_similar_ads: "مشابہ اشتہارات",
    ad_detail_swap_request: "تبادلہ کی درخواست",
    ad_detail_boost: "بوسٹ",
    ad_detail_play_voice: "آواز کی تفصیل سنیں",
    ad_detail_stop_voice: "آواز بند کریں",
    ad_detail_error_load: "اشتہار کی تفصیلات لوڈ نہیں ہو سکیں۔",
    ad_detail_error_share: "اشتہار شیئر نہیں کیا جا سکا۔",
    ad_detail_error_favorite: "پسندیدہ اپ ڈیٹ نہیں ہو سکا",
    ad_detail_error_voice: "آواز کی تفصیل چلائی نہیں جا سکی",
    ad_detail_error_boost: "بوسٹ لنک بنایا نہیں جا سکا",
    ad_detail_error_seller: "فروخت کنندہ کی معلومات نہیں ملی",
    ad_detail_error_chat: "فروخت کنندہ سے چیٹ شروع نہیں ہو سکی۔",
    ad_detail_login_required: "لاگ ان ضروری",
    ad_detail_login_message: "براہ کرم تبادلہ کی درخواست بھیجنے کے لیے لاگ ان کریں",
    ad_detail_cannot_swap: "تبادلہ نہیں ہو سکتا",
    ad_detail_cannot_swap_own: "آپ اپنے اشتہار کے لیے تبادلہ کی درخواست نہیں بھیج سکتے",
    ad_detail_no_active_ads: "کوئی فعال اشتہار نہیں",
    ad_detail_no_active_ads_message: "آپ کے پاس کوئی فعال اشتہار نہیں ہے۔ براہ کرم پہلے ایک اشتہار بنائیں اور اسے منظور کروائیں۔",
    ad_detail_only_one_ad: "آپ کے پاس صرف 1 فعال اشتہار ہے، اور آپ اشتہار کو خود سے تبدیل نہیں کر سکتے۔ براہ کرم پہلے دوسرا فعال اشتہار بنائیں۔",
    ad_detail_no_available_ads: "کوئی دستیاب اشتہار نہیں",
    ad_detail_select_ad: "براہ کرم تبادلہ کے لیے ایک اشتہار منتخب کریں",
    ad_detail_swap_success: "تبادلہ کی درخواست کامیابی سے بھیج دی گئی!",
    ad_detail_swap_error: "تبادلہ کی درخواست بنائی نہیں جا سکی",
    ad_detail_report_reason: "براہ کرم ایک وجہ درج کریں۔",
    ad_detail_report_success: "آپ کی رپورٹ کامیابی سے جمع کر دی گئی۔",
    ad_detail_report_error: "رپورٹ جمع نہیں ہو سکی",
    ad_detail_report_title: "اشتہار رپورٹ کریں",
    ad_detail_report_placeholder: "رپورٹ کرنے کی وجہ درج کریں...",
    ad_detail_swap_title: "تبادلہ کے لیے اپنا اشتہار منتخب کریں",
    ad_detail_swap_message: "پیغام (اختیاری)",
    ad_detail_swap_placeholder: "فروخت کنندہ کے لیے پیغام شامل کریں...",
    ad_detail_share_message: "MEGO پر یہ اشتہار دیکھیں:",
    ad_detail_boost_share_message: "یہ اشتہار دیکھیں:\n\nمفت بوسٹ حاصل کرنے کے لیے 3 دوستوں کے ساتھ شیئر کریں!",
    
    // Post Ad
    post_ad_basic_info: "بنیادی معلومات",
    post_ad_details: "تفصیلات",
    post_ad_media_contact: "میڈیا اور رابطہ",
    post_ad_category: "زمرہ",
    post_ad_select_category: "زمرہ منتخب کریں",
    post_ad_type: "اشتہار کی قسم",
    post_ad_select_type: "قسم منتخب کریں",
    post_ad_condition: "حالت",
    post_ad_select_condition: "حالت منتخب کریں",
    post_ad_title: "عنوان",
    post_ad_title_placeholder: "اشتہار کا عنوان درج کریں",
    post_ad_price: "قیمت",
    post_ad_price_placeholder: "قیمت درج کریں",
    post_ad_negotiable: "قابل گفتگو",
    post_ad_description: "تفصیل",
    post_ad_description_placeholder: "اپنی چیز کی تفصیل...",
    post_ad_location: "مقام",
    post_ad_location_placeholder: "مقام درج کریں",
    post_ad_contact: "رابطہ",
    post_ad_contact_placeholder: "فون نمبر",
    post_ad_images: "تصاویر",
    post_ad_add_images: "تصاویر شامل کریں",
    post_ad_voice_description: "آواز کی تفصیل",
    post_ad_record_voice: "آواز ریکارڈ کریں",
    post_ad_stop_recording: "ریکارڈنگ بند کریں",
    post_ad_required_fields: "⚠️ ضروری فیلڈز",
    post_ad_fill_all: "براہ کرم تمام ضروری فیلڈز بھریں",
    post_ad_success: "اشتہار کامیابی سے پوسٹ ہو گیا! آپ نے 25 پوائنٹس کمائے۔",
    post_ad_error: "سرور سے غیر متوقع جواب",
    post_ad_upload_failed: "اپ لوڈ ناکام",
    post_ad_failed: "اشتہار پوسٹ نہیں کیا جا سکا",
    post_ad_sell: "فروخت",
    post_ad_rent: "کرایہ",
    post_ad_exchange: "تبادلہ",
    post_ad_new: "نیا",
    post_ad_used: "استعمال شدہ",
    
    // Profile & Other
    profile_title: "پروفائل",
    my_ads_title: "میرے اشتہارات",
    favorites_title: "پسندیدہ",
    notifications_title: "اطلاعات",
    help_title: "مدد اور سپورٹ",
    help_subtitle: "کسی بھی وقت مدد حاصل کریں",
    help_faq: "اکثر پوچھے جانے والے سوالات",
    help_contact: "سپورٹ سے رابطہ",
    referral_title: "دعوت دیں اور کمائیں",
    referral_subtitle: "شیئر کریں اور انعام حاصل کریں",
    referral_code: "آپ کا حوالہ کوڈ",
    referral_copy: "کاپی",
    referral_share: "شیئر",
    referral_loading: "لوڈ ہو رہا ہے...",
    
    // Profile & Other
    profile_title: "پروفائل",
    profile_edit: "پروفائل میں ترمیم کریں",
    profile_logout: "لاگ آؤٹ",
    profile_update_success: "پروفائل تصویر اپ ڈیٹ ہو گئی!",
    profile_update_error: "پروفائل تصویر اپ ڈیٹ نہیں ہو سکی۔",
    profile_loading: "پروفائل لوڈ ہو رہی ہے...",
    
    my_ads_title: "میرے اشتہارات",
    my_ads_active: "فعال",
    my_ads_pending: "زیر التواء",
    my_ads_sold: "فروخت شدہ",
    my_ads_rejected: "مسترد",
    my_ads_delete: "اشتہار حذف کریں",
    my_ads_delete_confirm: "کیا آپ یقینی ہیں؟",
    my_ads_delete_success: "اشتہار کامیابی سے حذف ہو گیا",
    my_ads_delete_error: "حذف ناکام",
    my_ads_mark_sold: "فروخت شدہ کے طور پر نشان زد کریں",
    my_ads_mark_sold_success: "اشتہار فروخت شدہ کے طور پر نشان زد ہو گیا",
    my_ads_mark_sold_error: "فروخت شدہ نشان زد کرنا ناکام",
    my_ads_load_error: "اشتہارات لوڈ نہیں ہو سکے",
    my_ads_no_ads: "کوئی اشتہار نہیں ملا",
    
    favorites_title: "پسندیدہ",
    favorites_empty: "ابھی تک کوئی پسندیدہ نہیں",
    favorites_empty_desc: "اپنی پسند کے اشتہارات محفوظ کرنا شروع کریں!",
    favorites_remove: "پسندیدہ سے ہٹائیں",
    favorites_load_error: "پسندیدہ لوڈ نہیں ہو سکے",
    favorites_remove_error: "پسندیدہ ہٹانا ناکام",
    
    notifications_title: "اطلاعات",
    notifications_empty: "کوئی اطلاع نہیں",
    notifications_mark_read: "پڑھا ہوا نشان زد کریں",
    notifications_delete: "اطلاع حذف کریں",
    notifications_delete_confirm: "کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟",
    notifications_delete_success: "کامیابی سے حذف ہو گیا",
    notifications_delete_error: "حذف ناکام",
    notifications_load_error: "اطلاعات لوڈ نہیں ہو سکیں",
    notifications_new: "نیا نوٹیفیکیشن",
    notifications_new_update: "آپ کو ایک نیا اپ ڈیٹ ملا!",
    
    help_title: "مدد اور سپورٹ",
    help_subtitle: "کسی بھی وقت مدد حاصل کریں",
    help_faq: "اکثر پوچھے جانے والے سوالات",
    help_contact: "سپورٹ سے رابطہ",
    help_message_placeholder: "اپنا مسئلہ بیان کریں...",
    help_send: "پیغام بھیجیں",
    help_sending: "بھیجا جا رہا ہے...",
    help_success: "آپ کی سپورٹ درخواست بھیج دی گئی!",
    help_error: "پیغام بھیجنا ناکام",
    help_message_required: "براہ کرم پیغام درج کریں",
    help_attach_image: "اسکرین شاٹ منسلک کریں",
    help_faq_1_q: "میں اشتہار کیسے پوسٹ کروں؟",
    help_faq_1_a: "ڈیش بورڈ → اشتہار پوسٹ کریں → تفصیلات بھریں اور تصویر اپ لوڈ کریں۔",
    help_faq_2_q: "میں اپنا پاس ورڈ کیسے ری سیٹ کروں؟",
    help_faq_2_a: "سیٹنگز → پاس ورڈ تبدیل کریں → نیا پاس ورڈ درج کریں۔",
    help_faq_3_q: "ڈارک موڈ کیسے فعال کریں؟",
    help_faq_3_a: "سیٹنگز → ڈارک موڈ ٹوگل آن کریں۔",
    help_faq_4_q: "میں اپنی پروفائل کیسے میں ترمیم کروں؟",
    help_faq_4_a: "پروفائل → اپنے نام یا تصویر پر ٹیپ کریں تاکہ اپ ڈیٹ کریں۔",
    
    // Chat
    chat_send: "بھیجیں",
    chat_placeholder: "پیغام ٹائپ کریں...",
    chat_empty: "ابھی تک کوئی پیغام نہیں",
    chat_loading: "پیغامات لوڈ ہو رہے ہیں...",
    
    // Wallet
    wallet_title: "پرس",
    wallet_balance: "بیلنس",
    wallet_points: "پوائنٹس",
    wallet_history: "لین دین کی تاریخ",
    
    // Change Password
    change_password_title: "پاس ورڈ تبدیل کریں",
    change_password_current: "موجودہ پاس ورڈ",
    change_password_new: "نیا پاس ورڈ",
    change_password_confirm: "نیا پاس ورڈ کی تصدیق",
    change_password_success: "پاس ورڈ کامیابی سے تبدیل ہو گیا!",
    change_password_error: "پاس ورڈ تبدیل کرنا ناکام",
    
    // Forgot Password
    forgot_password_title: "پاس ورڈ بھول گئے",
    forgot_password_subtitle: "پاس ورڈ ری سیٹ کرنے کے لیے اپنا فون نمبر درج کریں",
    forgot_password_send: "OTP بھیجیں",
    forgot_password_sending: "OTP بھیجا جا رہا ہے...",
    
    // OTP
    otp_title: "OTP کی تصدیق کریں",
    otp_subtitle: "اپنے فون پر بھیجا گیا کوڈ درج کریں",
    otp_verify: "تصدیق کریں",
    otp_verifying: "تصدیق ہو رہی ہے...",
    otp_resend: "OTP دوبارہ بھیجیں",
    otp_invalid: "غلط OTP",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  ready: false,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem("appLanguage");
        if (stored) setLanguageState(stored);
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem("appLanguage", lang);
    } catch {
      setLanguageState(lang);
    }
  }, []);

  const t = useCallback(
    (key, fallback) => {
      return (
        translations[language]?.[key] ??
        translations.en[key] ??
        fallback ??
        key
      );
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      ready,
    }),
    [language, setLanguage, t, ready]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

