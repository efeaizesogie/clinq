"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Brain,
  Baby,
  Sparkles,
  Activity,
  Eye,
  User,
  Image,
  AlertCircle,
  MapPin,
  Clock,
  Video,
  Check,
  Star,
  Globe,
  Settings,
  HelpCircle,
  ChevronDown,
  Calendar,
  Printer,
  Share2
} from "lucide-react";

// Specialties mapping details
interface Specialty {
  name: string;
  icon: React.ReactNode;
  desc: string;
}

const specialtiesList: Specialty[] = [
  {
    name: "Cardiology",
    icon: <Heart className="w-[25px] h-[22.94px]" />,
    desc: "Heart health, cardiovascular diseases, and vascular testing."
  },
  {
    name: "Dermatology",
    icon: <Sparkles className="w-[23.75px] h-[25.62px]" />,
    desc: "Advanced skincare solutions and chronic skin restoration."
  },
  {
    name: "Pediatrics",
    icon: <Baby className="w-[22.5px] h-[22.5px]" />,
    desc: "Dedicated wellness wellness checks for infants and children."
  },
  {
    name: "Neurology",
    icon: <Brain className="w-[23.76px] h-[25px]" />,
    desc: "Expert diagnosis and neurodegenerative disorder treatments."
  },
  {
    name: "Orthopedics",
    icon: <Activity className="w-[23.75px] h-[12.5px]" />,
    desc: "Specialized joint reconstruction, skeletal, and muscle care."
  },
  {
    name: "Ophthalmology",
    icon: <Eye className="w-[27.5px] h-[18.75px]" />,
    desc: "Comprehensive vision testing and surgical restoration."
  },
  {
    name: "Gynecology",
    icon: <User className="w-[13.75px] h-[21.25px]" />,
    desc: "Maternal consulting and female reproductive wellness care."
  },
  {
    name: "Internal Medicine",
    icon: <Globe className="w-[25px] h-[25px]" />,
    desc: "Primary care, chronic disease management, and prevention."
  },
  {
    name: "Radiology",
    icon: <Image className="w-[17.5px] h-[23.75px]" />,
    desc: "Diagnostic screenings, X-Ray, MRI, and imaging scans."
  }
];

// Doctor interface matching seed data
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  bio: string;
  initials: string;
  colorGrad: string;
  isAvailable: boolean;
  availabilityText: string;
  gender: "Male" | "Female";
  languages: string[];
  imageNum: number;
}

const docsList: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Aris Thorne",
    specialty: "Cardiology",
    experience: "15+ Years",
    rating: 4.9,
    bio: "Specializing in cardiac surgery and heart failure management.",
    initials: "AT",
    colorGrad: "from-blue-600 to-indigo-800",
    isAvailable: true,
    availabilityText: "AVAILABLE TODAY",
    gender: "Male",
    languages: ["English", "Spanish"],
    imageNum: 1
  },
  {
    id: "doc-2",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    experience: "8 Years",
    rating: 4.9,
    bio: "Pioneered heart rhythm diagnostics and coronary angioplasty therapeutic treatments.",
    initials: "SJ",
    colorGrad: "from-teal-600 to-blue-800",
    isAvailable: false,
    availabilityText: "NEXT SLOT: MON",
    gender: "Female",
    languages: ["English"],
    imageNum: 2
  },
  {
    id: "doc-3",
    name: "Dr. Elena Vance",
    specialty: "Neurology",
    experience: "12+ Years",
    rating: 4.8,
    bio: "Expert in neurodegenerative disorders and advanced migraine treatments.",
    initials: "EV",
    colorGrad: "from-purple-600 to-indigo-800",
    isAvailable: true,
    availabilityText: "AVAILABLE TODAY",
    gender: "Female",
    languages: ["English", "Spanish"],
    imageNum: 3
  },
  {
    id: "doc-4",
    name: "Dr. Julian Marc",
    specialty: "Pediatrics",
    experience: "10+ Years",
    rating: 4.7,
    bio: "Dedicated to holistic child healthcare from infancy through adolescence.",
    initials: "JM",
    colorGrad: "from-emerald-500 to-teal-700",
    isAvailable: true,
    availabilityText: "AVAILABLE TODAY",
    gender: "Male",
    languages: ["English", "French"],
    imageNum: 4
  },
  {
    id: "doc-5",
    name: "Dr. Marcus Vance",
    specialty: "Orthopedics",
    experience: "14+ Years",
    rating: 4.8,
    bio: "Specializes in athletic joint reconstructive surgery and bone pathology.",
    initials: "MV",
    colorGrad: "from-orange-500 to-rose-700",
    isAvailable: true,
    availabilityText: "AVAILABLE TODAY",
    gender: "Male",
    languages: ["English"],
    imageNum: 5
  },
  {
    id: "doc-6",
    name: "Dr. Clara Shore",
    specialty: "Dermatology",
    experience: "11 Years",
    rating: 4.9,
    bio: "Focuses on skin restoration and chronic dermatology conditions.",
    initials: "CS",
    colorGrad: "from-pink-500 to-purple-800",
    isAvailable: false,
    availabilityText: "NEXT SLOT: WED",
    gender: "Female",
    languages: ["English"],
    imageNum: 6
  }
];

export default function BookAppointmentPage() {
  const router = useRouter();
  
  // Custom stepper states
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Cardiology"); // Default Cardiology to make UX beautiful
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(docsList[0]); // Default Dr. Aris Thorne
  const [selectedDate, setSelectedDate] = useState<number>(23); // Default Wed 23
  const [selectedTime, setSelectedTime] = useState<string>("11:15 AM"); // Default selected
  const [visitType, setVisitType] = useState<"In-Person" | "Telehealth">("In-Person");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filters state
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);
  const [filterGender, setFilterGender] = useState<"Male" | "Female" | "Any">("Any");
  const [filterLanguage, setFilterLanguage] = useState<string[]>(["English"]);

  // Date lists data
  const dateMap: { [key: number]: string } = {
    21: "Monday, October 21",
    22: "Tuesday, October 22",
    23: "Wednesday, October 23",
    24: "Thursday, October 24",
    25: "Friday, October 25",
    26: "Saturday, October 26",
    27: "Sunday, October 27"
  };

  const weekdaysData = [
    { dayName: "MON", dateVal: 21, active: true },
    { dayName: "TUE", dateVal: 22, active: true },
    { dayName: "WED", dateVal: 23, active: true },
    { dayName: "THU", dateVal: 24, active: true },
    { dayName: "FRI", dateVal: 25, active: true },
    { dayName: "SAT", dateVal: 26, active: false },
    { dayName: "SUN", dateVal: 27, active: false }
  ];

  // Specialty selection handler
  const handleSelectSpecialty = (name: string) => {
    setSelectedSpecialty(name);
    // Auto-select a doctor of this specialty if exists
    const matchingDocs = docsList.filter((d) => d.specialty.toLowerCase() === name.toLowerCase());
    if (matchingDocs.length > 0) {
      setSelectedDoctor(matchingDocs[0]);
    } else {
      setSelectedDoctor(null);
    }
    setStep(2);
  };

  // Doctor selection handler
  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedTime("11:15 AM"); // Default selected slot
    setStep(3);
  };

  // Doctors filtering
  const filteredDoctors = docsList.filter((doc) => {
    if (selectedSpecialty && doc.specialty.toLowerCase() !== selectedSpecialty.toLowerCase()) {
      return false;
    }
    if (filterTodayOnly && !doc.isAvailable) {
      return false;
    }
    if (filterGender !== "Any" && doc.gender !== filterGender) {
      return false;
    }
    const matchesLanguage = doc.languages.some((l) => filterLanguage.includes(l));
    if (filterLanguage.length > 0 && !matchesLanguage) {
      return false;
    }
    return true;
  });

  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : docsList;

  // Confirm booking action
  const handleConfirmBooking = () => {
    setBookingSuccess(true);
  };

  if (bookingSuccess) {
    const dayNum = selectedDate;
    return (
      <div className="w-full px-4 py-4 md:p-6 lg:p-8 flex flex-col gap-12 bg-[#F8F9FF] font-sans antialiased text-[#42474F] relative min-h-[90vh]">
        
        {/* Success Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 w-full">
          <div className="w-24 h-24 bg-[#0F4C81]/10 shadow-[0px_0px_40px_rgba(15,76,129,0.15)] rounded-12px flex items-center justify-center shrink-0">
            <Check className="w-[50px] h-[50px] text-[#00355F] stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-2 max-w-[600px]">
            <h2 className="text-[32px] font-[700] text-[#00355F] leading-[56px] tracking-[-0.96px] font-sans">
              Appointment Confirmed!
            </h2>
            <p className="text-[18px] leading-7 text-[#42474F]">
              Your appointment with <strong className="text-[#0D1C2E] font-[600]">{selectedDoctor?.name || 'Dr. Aris Thorne'}</strong> has been successfully scheduled. A confirmation email has been sent to your inbox.
            </p>
          </div>
        </section>

        {/* Info Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          
          {/* Details Card */}
          <div className="lg:col-span-2 bg-white border border-[#C2C7D1] rounded-lg p-8 flex flex-col gap-6 w-full justify-between">
            <h3 className="text-[18px] font-[600] text-[#00355F] leading-none font-sans">
              Confirmation Details
            </h3>

            <div className="flex flex-col gap-5 w-full">
              {/* Row 1 Booking ID */}
              <div className="flex justify-between items-center border-b border-[#C2C7D1]/30 pb-4 w-full">
                <span className="text-[16px] text-[#42474F]">Booking ID</span>
                <strong className="text-[16px] font-[600] text-[#0D1C2E] tracking-[0.8px] font-sans uppercase">
                  CNQ-98234-L
                </strong>
              </div>

              {/* Row 2 Date */}
              <div className="flex justify-between items-center border-b border-[#C2C7D1]/30 pb-4 w-full">
                <div className="flex items-center gap-3 text-[#42474F]">
                  <Calendar className="w-5 h-5 text-[#00355F]" />
                  <span className="text-[16px]">Date</span>
                </div>
                <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans">
                  {dateMap[selectedDate]}
                </strong>
              </div>

              {/* Row 3 Time */}
              <div className="flex justify-between items-center border-b border-[#C2C7D1]/30 pb-4 w-full">
                <div className="flex items-center gap-3 text-[#42474F]">
                  <Clock className="w-5 h-5 text-[#00355F]" />
                  <span className="text-[16px]">Time</span>
                </div>
                <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans">
                  {selectedTime} EST
                </strong>
              </div>

              {/* Row 4 Visit Format */}
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3 text-[#42474F]">
                  {visitType === "In-Person" ? (
                    <MapPin className="w-4 h-5 text-[#00355F]" />
                  ) : (
                    <Video className="w-[18px] h-5 text-[#00355F]" />
                  )}
                  <span className="text-[16px]">Type</span>
                </div>
                <strong className="text-[16px] font-[600] text-[#0D1C2E] text-right font-sans">
                  {visitType === "In-Person" ? "In-Person Consult" : "Telehealth Consultation"}
                </strong>
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="lg:col-span-1 bg-[#0F4C81] rounded-8px p-8 flex flex-col items-center justify-center text-center gap-6 w-full text-white">
            <div className="w-[40px] h-[44px] text-[#8EBDF9] shrink-0">
              <Calendar className="w-full h-full stroke-[1.5]" />
            </div>

            <div className="flex flex-col gap-2">
              <strong className="text-[24px] font-[600] text-[#8EBDF9] tracking-[0.6px] leading-[32px] font-sans uppercase">
                OCT {dayNum}
              </strong>
              <p className="text-[16px] text-[#8EBDF9]/80 font-[400] max-w-[200px] leading-6">
                Add this event directly to your digital calendar
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button className="w-full py-2.5 bg-white text-[#00355F] hover:bg-white/90 transition-colors text-[12px] font-[700] tracking-[1.2px] rounded-[2px] uppercase select-none cursor-pointer">
                ADD TO CALENDAR
              </button>

              <div className="flex gap-4 justify-center items-center text-[#8EBDF9] mt-2">
                <Calendar className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                <Clock className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                <Share2 className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
          </div>

        </section>

        {/* Actions Row */}
        <section className="flex gap-4 w-full justify-center max-w-[800px] mx-auto mt-2">
          <button
            onClick={() => router.push("/patient")}
            className="flex-1 max-w-[391px] h-[58px] bg-[#00355F] hover:bg-[#002645] text-white text-[16px] font-[700] rounded-[4px] uppercase tracking-[0.6px] transition-colors cursor-pointer select-none"
          >
            Go To Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 max-w-[393px] h-[58px] border border-[#00355F] hover:bg-[#EFF4FF] text-[#00355F] text-[16px] font-[700] rounded-[4px] uppercase tracking-[0.6px] transition-colors cursor-pointer select-none flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Confirmation</span>
          </button>
        </section>

        {/* Helpful Links & Next Steps */}
        <section className="border-t border-[#C2C7D1] pt-12 flex flex-col gap-6 w-full">
          <h4 className="text-[16px] font-[700] text-[#0D1C2E] font-sans">
            Helpful Resources
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Link 1 */}
            <div 
              onClick={() => router.push("/patient")}
              className="bg-white border border-[#C2C7D1]/40 hover:border-[#00355F]/40 p-4 rounded-lg flex gap-4 cursor-pointer transition-all w-full"
            >
              <div className="w-[36px] h-[42px] bg-[#D4E6E5] rounded-[2px] text-[#576867] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <strong className="text-[16px] font-[600] text-[#00355F] font-sans">Prepare for Visit</strong>
                <span className="text-[14px] text-[#42474F] mt-1.5 leading-normal">
                  Update medical history or upload recent files before check-in.
                </span>
              </div>
            </div>

            {/* Link 2 */}
            <div 
              onClick={() => router.push("/patient/appointments")}
              className="bg-white border border-[#C2C7D1]/40 hover:border-[#00355F]/40 p-4 rounded-lg flex gap-4 cursor-pointer transition-all w-full"
            >
              <div className="w-[34px] h-[40px] bg-[#D4E6E5] rounded-[2px] text-[#576867] flex items-center justify-center shrink-0">
                <MapPin className="w-[18px] h-[18px] stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <strong className="text-[16px] font-[600] text-[#00355F] font-sans">Clinic Location</strong>
                <span className="text-[14px] text-[#42474F] mt-1.5 leading-normal">
                  MedCore Main Plaza Tower A, Suite 402. Map and parking details.
                </span>
              </div>
            </div>

          </div>
        </section>

      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 md:p-6 lg:p-8 flex flex-col gap-10 bg-[#F8F9FF] font-sans antialiased text-[#42474F] relative min-h-[90vh]">
      
      {/* ── Stepper Header Section (Width 976px limit matched) ── */}
      <section className="flex flex-col gap-6 w-full shrink-0">
        
        {/* Top Header Row with Title & Back Arrow */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.push("/patient/appointments")}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[#C2C7D1] hover:bg-[#EFF4FF] text-[#00355F] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="text-[12px] font-[600] tracking-[1.2px] text-[#42474F] uppercase">
                STEP {step} OF 4
              </span>
              
              {/* Conditional Title Headers */}
              {step === 2 ? (
                <h2 className="text-[24px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] font-sans">
                  Select a Specialist
                </h2>
              ) : step === 3 ? (
                <h2 className="text-[24px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] font-sans col-span-1">
                  Select Appointment Time
                </h2>
              ) : (
                <h2 className="text-[24px] font-[600] leading-10 tracking-[-0.32px] text-[#00355F] font-sans">
                  Schedule Your Visit
                </h2>
              )}
            </div>
          </div>

          {/* Visit Type Toggle: Embedded on the right side next to heading for Step 3 */}
          {step === 3 && (
            <div className="flex items-center justify-start lg:justify-end">
              <div className="flex p-1 bg-[#EFF4FF] border border-[#C2C7D1] rounded-[12px] h-[58px] w-[228.14px] items-center gap-0">
                <button
                  type="button"
                  onClick={() => setVisitType("In-Person")}
                  className={`w-[103.48px] h-12 rounded-[11px] text-[12px] font-[600] tracking-[0.6px] uppercase transition-all cursor-pointer ${
                    visitType === "In-Person"
                      ? "bg-[#00355F] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                      : "text-[#42474F] hover:bg-white/50"
                  }`}
                >
                  In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType("Telehealth")}
                  className={`w-[114.66px] h-12 rounded-[11px] text-[12px] font-[600] tracking-[0.6px] uppercase transition-all cursor-pointer ${
                    visitType === "Telehealth"
                      ? "bg-[#00355F] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                      : "text-[#42474F] hover:bg-white/50"
                  }`}
                >
                  Telehealth
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Progress indicators */}
        <div className="flex items-center gap-1 sm:gap-2.5 overflow-x-auto py-2 w-full max-w-[800px] select-none scrollbar-none">
          {/* Step 1 indicator always completed or active */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              onClick={() => setStep(1)}
              className={`flex items-center justify-center w-8 h-8 rounded-[12px] font-[700] text-[14px] transition-all cursor-pointer ${
                step === 1
                  ? "border-2 border-[#00355F] text-[#00355F]"
                  : "bg-[#00355F] text-white"
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4 text-white stroke-[3]" /> : "1"}
            </div>
            <span className="text-[12px] font-[600] tracking-[0.6px] text-[#00355F]">
              Specialty
            </span>
          </div>

          <div className={`w-[32px] sm:w-[48px] h-px shrink-0 ${
            step >= 2 ? "bg-[#00355F]" : "bg-[#C2C7D1]"
          }`} />

          {/* Step 2 indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              onClick={() => step > 2 && setStep(2)}
              className={`flex items-center justify-center w-8 h-8 rounded-[12px] font-[700] text-[14px] transition-all ${
                step === 2
                  ? "border-2 border-[#00355F] text-[#00355F]"
                  : step > 2
                  ? "bg-[#00355F] text-white cursor-pointer"
                  : "bg-[#E6EEFF] text-[#42474F]"
              }`}
            >
              {step > 2 ? <Check className="w-4 h-4 text-white stroke-[3]" /> : "2"}
            </div>
            <span className={`text-[12px] font-[600] tracking-[0.6px] ${
              step >= 2 ? "text-[#00355F]" : "text-[#42474F]"
            }`}>
              Doctor
            </span>
          </div>

          <div className={`w-[32px] sm:w-[48px] h-px shrink-0 ${
            step >= 3 ? "bg-[#00355F]" : "bg-[#C2C7D1]"
          }`} />

          {/* Step 3 indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              onClick={() => step > 3 && setStep(3)}
              className={`flex items-center justify-center w-8 h-8 rounded-[12px] font-[700] text-[14px] border transition-all ${
                step === 3
                  ? "border-2 border-[#00355F] text-[#00355F]"
                  : step > 3
                  ? "bg-[#00355F] text-white cursor-pointer"
                  : "bg-[#E6EEFF] text-[#42474F]"
              }`}
            >
              {step > 3 ? <Check className="w-4 h-4 text-white stroke-[3]" /> : "3"}
            </div>
            <span className={`text-[12px] font-[600] tracking-[0.6px] ${
              step >= 3 ? "text-[#00355F]" : "text-[#42474F]"
            }`}>
              Time
            </span>
          </div>

          <div className={`w-[32px] sm:w-[48px] h-px shrink-0 ${
            step >= 4 ? "bg-[#00355F]" : "bg-[#C2C7D1]"
          }`} />

          {/* Step 4 indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-[12px] font-[700] text-[14px] transition-all ${
                step === 4
                  ? "border-2 border-[#00355F] text-[#00355F]"
                  : "bg-[#E6EEFF] text-[#42474F]"
              }`}
            >
              4
            </div>
            <span className={`text-[12px] font-[600] tracking-[0.6px] ${
              step >= 4 ? "text-[#00355F]" : "text-[#42474F]"
            }`}>
              Confirm
            </span>
          </div>
        </div>

        {/* Ambient Alert Bar */}
        <div className="flex items-center gap-3 p-4 bg-[#0F4C81] rounded-[4px] text-[#8EBDF9] w-full shrink-0">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-[16px] font-[400] leading-6 font-sans">
            {step === 1 && "Select the medical specialty that matches your health concerns."}
            {step === 2 && "Select from our board-certified specialist physicians."}
            {step === 3 && `Showing available time for ${selectedDoctor?.name || 'Dr. Thorne'}. Choose a convenient slot for your visit with ${selectedDoctor?.name || 'Dr. Thorne'}.`}
            {step === 4 && "Review your booking itinerary details and confirm appointment."}
          </span>
        </div>
      </section>

      {/* ── Active Wizard Panels ── */}
      <section className="w-full ">

        {/* STEP 1: Specialties Grid */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {specialtiesList.map((spec, index) => {
              const isSelected = selectedSpecialty === spec.name;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectSpecialty(spec.name)}
                  className={`flex flex-col items-start gap-4 p-8 bg-white border rounded-lg text-left shadow-[0px_4px_20px_rgba(15,76,129,0.04)] hover:shadow-md transition-all cursor-pointer group relative ${
                    isSelected ? "border-[#00355F] ring-1 ring-[#00355F]" : "border-[#C2C7D1]"
                  }`}
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-[#EFF4FF] rounded-[12px] text-[#00355F]">
                    {spec.icon}
                  </div>
                  
                  <div className="flex flex-col gap-2 pb-6">
                    <h3 className="text-[18px] font-[600] leading-8 text-[#0D1C2E] font-sans">
                      {spec.name}
                    </h3>
                    <p className="text-[14px] leading-5 text-[#42474F]">
                      {spec.desc}
                    </p>
                  </div>

                  <div className="absolute bottom-6 left-8 flex items-center gap-2 text-[12px] font-[700] tracking-[0.6px] text-[#00355F] uppercase select-none group-hover:translate-x-1 transition-transform">
                    <span>SELECT DEPARTMENT</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2: Doctor Selection & Sidebar */}
        {step === 2 && (
          <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
            
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-[288px] flex flex-col gap-6 p-6 bg-[#F8F9FF] border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg shrink-0">
              <div className="flex justify-between items-center w-full">
                <span className="text-[18px] font-[700] text-[#00355F] font-sans leading-7">
                  Filters
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[12px] font-[600] text-[#00355F] hover:underline uppercase tracking-[0.6px] cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {/* Availability */}
              <div className="flex flex-col gap-4 border-t border-[#C2C7D1]/50 pt-4">
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">
                  AVAILABILITY
                </span>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterTodayOnly}
                      onChange={(e) => setFilterTodayOnly(e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`w-5 h-5 rounded-[2px] border transition-colors flex items-center justify-center ${
                      filterTodayOnly ? "bg-[#00355F] border-[#00355F]" : "bg-white border-[#C2C7D1]"
                    }`}>
                      {filterTodayOnly && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </span>
                    <span className="text-[14px] text-[#0D1C2E]">Available Today</span>
                  </label>
                  <label className="flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <input type="checkbox" disabled className="w-5 h-5 border-[#C2C7D1] rounded-[2px]" />
                    <span className="text-[14px] text-[#0D1C2E]">Next 3 Days</span>
                  </label>
                  <label className="flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <input type="checkbox" disabled className="w-5 h-5 border-[#C2C7D1] rounded-[2px]" />
                    <span className="text-[14px] text-[#0D1C2E]">Available This Week</span>
                  </label>
                </div>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-4 border-t border-[#C2C7D1]/50 pt-4">
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">
                  GENDER
                </span>
                <div className="flex flex-col gap-3">
                  {["Any", "Male", "Female"].map((g) => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="genderFilter"
                        checked={filterGender === g}
                        onChange={() => setFilterGender(g as any)}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 rounded-full border transition-colors flex items-center justify-center ${
                        filterGender === g ? "bg-[#00355F] border-[#00355F]" : "bg-white border-[#C2C7D1]"
                      }`}>
                        {filterGender === g && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </span>
                      <span className="text-[14px] text-[#0D1C2E]">{g === "Any" ? "Any Gender" : g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="flex flex-col gap-4 border-t border-[#C2C7D1]/50 pt-4">
                <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">
                  LANGUAGE
                </span>
                <div className="flex flex-col gap-3">
                  {["English", "Spanish", "French"].map((lang) => {
                    const isChecked = filterLanguage.includes(lang);
                    return (
                      <label key={lang} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleLanguage(lang)}
                          className="sr-only"
                        />
                        <span className={`w-5 h-5 rounded-[2px] border transition-colors flex items-center justify-center ${
                          isChecked ? "bg-[#00355F] border-[#00355F]" : "bg-white border-[#C2C7D1]"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </span>
                        <span className="text-[14px] text-[#0D1C2E]">{lang}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Doctors Grid Column */}
            <div className="flex-1 flex flex-col gap-6 w-full  min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {displayDoctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col bg-[#F8F9FF] border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden h-[241px] relative"
                    >
                      <div className="flex gap-4 p-5 h-[180px]">
                        <div className="w-[96px] h-[96px] rounded bg-gradient-to-br from-slate-200 to-slate-300 border border-[#C2C7D1] flex flex-col justify-center items-center text-[#00355F] font-[800] text-[20px] shrink-0">
                          {doc.initials}
                        </div>
                        
                        <div className="flex flex-col gap-1 min-w-0 flex-grow">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-[18px] font-[700] text-[#00355F] truncate font-sans">{doc.name}</h4>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#DCE9FF] rounded-sm text-[#00355F] text-[12px] font-[600] shrink-0">
                              <Star className="w-3.5 h-3.5 fill-[#00355F] stroke-none" />
                              <span>{doc.rating}</span>
                            </div>
                          </div>
                          <span className="text-[14px] text-[#516161] truncate font-sans">{doc.specialty}</span>
                          
                          <div className="flex flex-wrap gap-2 mt-2 select-none">
                            <span className="px-2 py-0.5 bg-[#EFF4FF] text-[#42474F] rounded-full text-[10px] uppercase font-[500]">
                              {doc.experience} EXP
                            </span>
                            <span className="px-2 py-0.5 bg-[#D4E6E5] text-[#576867] rounded-full text-[10px] uppercase font-[500]">
                              {doc.availabilityText}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-[56px] border-t border-[#C2C7D1] px-5 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2 text-[#42474F] text-[14px]">
                          <Video className="w-4 h-4 text-[#42474F]" />
                          <span>In-Person & Video</span>
                        </div>
                        <button
                          onClick={() => handleSelectDoctor(doc)}
                          className="h-[36px] w-[88.72px] bg-[#00355F] hover:bg-[#002645] text-white transition-colors rounded-[4px] text-[12px] font-[600] tracking-[0.6px] uppercase cursor-pointer"
                        >
                          SELECT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View More Doctors button */}
              <div className="w-full flex justify-center mt-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-[260.67px] h-[50px] border border-[#00355F] rounded-[4px] text-[16px] font-[700] text-[#00355F] hover:bg-[#EFF4FF] transition-colors select-none uppercase cursor-pointer"
                >
                  <span>View More Doctors</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: Weekly Calendar & Day Selection (Split layout) */}
        {step === 3 && (
          <div className="flex flex-col lg:flex-row gap-6 w-full items-start relative pb-10">
            
            {/* Left/Middle Column Template: Weekly Calendar View (Width 640px) */}
            <div className="w-full flex-1 flex flex-col gap-6 shrink-0">
              
              {/* Calendar Wrapper Panel */}
              <div className="flex flex-col bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg overflow-hidden w-full h-[562px]">
                
                {/* Header Row */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#C2C7D1] h-[67px]">
                  <button type="button" className="flex items-center justify-center p-1 rounded hover:bg-[#EFF4FF] cursor-pointer text-[#0D1C2E]">
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <h4 className="text-[24px] font-[600] text-[#00355F] font-sans leading-8 select-none">
                    October 21 - 27, 2024
                  </h4>
                  <button type="button" className="flex items-center justify-center p-1 rounded hover:bg-[#EFF4FF] cursor-pointer text-[#0D1C2E]">
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* 7-Day Columns Day Grid Header (Height 84) */}
                <div className="grid grid-cols-7 border-b border-[#C2C7D1] h-[84px]">
                  {weekdaysData.map((d) => {
                    const isSelected = selectedDate === d.dateVal;
                    return (
                      <div
                        key={d.dateVal}
                        onClick={() => d.active && setSelectedDate(d.dateVal)}
                        className={`flex flex-col items-center justify-center py-4 border-r border-[#C2C7D1]/50 last:border-r-0 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#0F4C81] text-[#8EBDF9]"
                            : d.active
                            ? "bg-[#EFF4FF] text-[#0D1C2E] hover:bg-[#D5E3FC]/60"
                            : "bg-[#EFF4FF] opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <span className={`text-[10px] font-[400] text-center select-none ${isSelected ? "text-[#8EBDF9]" : "text-[#42474F]"}`}>
                          {d.dayName}
                        </span>
                        <span className={`text-[24px] font-[600] mt-0.5 leading-8 select-none ${isSelected ? "text-[#8EBDF9]" : "text-[#0D1C2E]"}`}>
                          {d.dateVal}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Slots Grid Area */}
                <div className="flex flex-col gap-6 p-8 h-[409px] overflow-y-auto">
                  
                  {/* Morning Section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#42474F]">
                      <Clock className="w-4 h-4" />
                      <span className="text-[12px] font-[600] tracking-[1.2px] text-[#42474F] uppercase">
                        MORNING
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {["09:00 AM", "10:00 AM", "11:15 AM", "11:30 AM"].map((time, idx) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`h-[50px] rounded-[4px] border text-[16px] transition-all flex items-center justify-center cursor-pointer select-none uppercase tracking-[0.6px] ${
                              isSelected
                                ? "bg-[#0F4C81] border-[#00355F] text-[#8EBDF9] font-[700]"
                                : "border-[#C2C7D1] text-[#0D1C2E] hover:bg-[#EFF4FF] font-[400]"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Section */}
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-2 text-[#42474F]">
                      <Clock className="w-4 h-4" />
                      <span className="text-[12px] font-[600] tracking-[1.2px] text-[#42474F] uppercase">
                        AFTERNOON
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {["01:30 PM", "02:00 PM", "03:00 PM", "04:30 PM"].map((time, idx) => {
                        const isSelected = selectedTime === time;
                        const isDisabled = time === "03:00 PM"; // Disabled mockup item
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => !isDisabled && setSelectedTime(time)}
                            className={`h-[50px] rounded-[4px] border text-[16px] transition-all flex items-center justify-center uppercase tracking-[0.6px] ${
                              isDisabled
                                ? "bg-[#EFF4FF] opacity-50 border-[#C2C7D1] text-[#727780] cursor-not-allowed font-[400]"
                                : isSelected
                                ? "bg-[#0F4C81] border-[#00355F] text-[#8EBDF9] font-[700]"
                                : "border-[#C2C7D1] text-[#0D1C2E] hover:bg-[#EFF4FF] cursor-pointer font-[400]"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Nav Border Row */}
              <div className="flex items-center justify-between border-t border-[#C2C7D1] pt-8 h-[81px] w-full mt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 text-[#00355F] text-[16px] font-[700] hover:underline cursor-pointer w-[177.31px] h-10 select-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Doctors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-[279.34px] h-[48px] bg-[#00355F] hover:bg-[#002645] text-white font-[700] text-[16px] rounded-lg shadow-[0px_4px_20px_rgba(15,76,129,0.04)] transition-all cursor-pointer select-none uppercase tracking-[0.6px]"
                >
                  Continue to Review
                </button>
              </div>

            </div>

            {/* Right Column Template: Summary Side Panel (Width 304px, left: 672px) */}
            <div className="w-full lg:w-[304px] flex flex-col gap-6 shrink-0 relative lg:sticky lg:top-5">
              
              {/* Card 1: Booking Summary */}
              <div className="bg-white border border-[#C2C7D1] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg p-6 flex flex-col gap-6 w-full h-[621px]">
                <h3 className="text-[18px] font-[600] text-[#00355F] font-sans pb-1 select-none border-none">
                  Booking Summary
                </h3>

                {/* Details list area */}
                <div className="flex flex-col gap-6 h-[391px] overflow-y-auto">
                  {/* Department row */}
                  <div className="flex gap-4 items-start w-full">
                    <div className="w-10 h-10 bg-[#DCE9FF] rounded-[4px] text-[#00355F] flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase leading-none">DEPARTMENT</span>
                      <strong className="text-[18px] font-[700] text-[#0D1C2E] font-sans mt-1 leading-none">{selectedSpecialty}</strong>
                    </div>
                  </div>

                  {/* Doctor row */}
                  <div className="flex gap-4 items-start w-full">
                    <div className="w-10 h-10 bg-[#DCE9FF] border border-[#C2C7D1] rounded-[4px] flex items-center justify-center shrink-0 text-[#00355F] font-[800] text-[14px]">
                      {selectedDoctor?.initials || "AT"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase leading-none">SPECIALIST PHYSICIAN</span>
                      <strong className="text-[18px] font-[700] text-[#0D1C2E] font-sans mt-1 leading-none truncate block w-44">{selectedDoctor?.name || 'Dr. Thorne'}</strong>
                      <span className="text-[12px] text-[#42474F] mt-1 pr-1">{selectedDoctor?.specialty}</span>
                    </div>
                  </div>

                  {/* Visit Format Info Tag */}
                  <div className="bg-[#EFF4FF] border border-[#C2C7D1]/30 rounded-[4px] p-4 flex flex-col gap-2 w-full select-none shrink-0 h-[102px]">
                    <div className="flex items-center gap-3 text-[#00355F]">
                      {visitType === "In-Person" ? (
                        <>
                          <MapPin className="w-4 h-5 text-[#00355F]" />
                          <span className="text-[12px] font-[700] tracking-[0.6px] uppercase">IN-PERSON VISIT</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-[18px] h-5 text-[#00355F]" />
                          <span className="text-[12px] font-[700] tracking-[0.6px] uppercase font-sans">TELEHEALTH VISIT</span>
                        </>
                      )}
                    </div>
                    <p className="text-[14px] leading-5 text-[#42474F] font-normal">
                      {visitType === "In-Person"
                        ? "Clinic: MedCore Main Plaza, Tower A, Suite 402."
                        : "Secure Video Conference Link will be emailed."}
                    </p>
                  </div>

                  {/* Selected Slot Recaps */}
                  <div className="border-t border-[#C2C7D1] pt-6 flex flex-col gap-3 w-full shrink-0 h-[109px]">
                    <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase select-none">
                      SELECTED SLOT
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-[#0D1C2E]">
                        <User className="w-4.5 h-[20px] text-[#42474F]" />
                        <span className="text-[16px] font-[400] bg-transparent">{dateMap[selectedDate]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#0D1C2E]">
                        <Clock className="w-5 h-[20px] text-[#42474F]" />
                        <span className="text-[16px] font-[700] bg-transparent">{selectedTime} (EST)</span>
                      </div>
                    </div>
                  </div>

                  {/* Gray co-pay alert footer tag */}
                  <div className="bg-[#E0E3E5] rounded-[4px] p-4 flex gap-3 items-start shrink-0 h-[100px]">
                    <AlertCircle className="w-5 h-5 text-[#444749] shrink-0 mt-0.5" />
                    <p className="text-[14px] leading-5 text-[#444749]">
                      Co-pay of $20.00 will be collected at check-in. Insurance verified.
                    </p>
                  </div>

                </div>
              </div>

              {/* Card 2: Need Help Card */}
              <div className="bg-[#0F4C81] shadow-[0px_4px_20px_rgba(15,76,129,0.04)] rounded-lg p-6 flex flex-col gap-3 w-full h-[160px]">
                <h4 className="text-[16px] font-[700] text-[#8EBDF9] font-sans pb-1 select-none leading-none">
                  Need Help?
                </h4>
                <p className="text-[14px] leading-5 text-[#8EBDF9] opacity-[0.8]">
                  Our patient support team is available 24/7 to assist you.
                </p>
                <div className="mt-2">
                  <a href="#" className="inline-flex items-center gap-2 text-[12px] font-[600] text-[#8EBDF9] underline uppercase tracking-[0.6px]">
                    <span>CONTACT SUPPORT</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* STEP 4: Checkout Confirmation Details */}
        {step === 4 && (
          <div className="flex flex-col lg:flex-row gap-8 w-full items-start select-none">
            
            {/* Left Column: Primary Details */}
            <div className="w-full lg:flex-1 flex flex-col gap-8">
              
              {/* Section: Patient & Reason */}
              <div className="bg-white border border-[#C2C7D1] rounded-lg p-8 flex flex-col gap-6 w-full h-[442px]">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#00355F] stroke-[2.5]" />
                  <h3 className="text-[18px] font-[600] text-[#0D1C2E] leading-8 font-sans">
                    Patient Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1 col-span-1">
                    <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase leading-none">FULL NAME</span>
                    <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans mt-2">Alexander Sterling</strong>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1 col-span-1">
                    <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase leading-none">PHONE NUMBER</span>
                    <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans mt-2">+1 (555) 012-3456</strong>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1 col-span-2 pt-2">
                    <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase leading-none">EMAIL ADDRESS</span>
                    <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans mt-2">a.sterling@example.email</strong>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div className="flex flex-col gap-2 w-full mt-1">
                  <span className="text-[12px] font-[600] tracking-[0.6px] text-[#42474F] uppercase">REASON FOR VISIT</span>
                  <textarea
                    placeholder="Please describe your symptoms or reason for visit (optional)"
                    className="w-full h-[128px] bg-[#F8F9FF] border border-[#C2C7D1] rounded-[4px] p-4 text-[16px] font-[400] text-[#0D1C2E] focus:outline-none focus:border-[#00355F] resize-none placeholder-[#6B7280]"
                  />
                </div>
              </div>

              {/* Section: Insurance */}
              <div className="bg-white border border-[#C2C7D1] rounded-lg p-8 flex flex-col gap-6 w-full h-[204px]">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-5 text-[#00355F] stroke-[2.5]" />
                    <h3 className="text-[18px] font-[600] text-[#0D1C2E] leading-8 font-sans">
                      Insurance Information
                    </h3>
                  </div>
                  <button className="text-[16px] font-[600] text-[#00355F] hover:underline cursor-pointer">
                    Edit
                  </button>
                </div>

                <div className="flex bg-white border border-[#C2C7D1] rounded-[4px] p-4 gap-4 items-center w-full h-[82px]">
                  <div className="w-[48px] h-[48px] bg-[#DCE9FF] rounded-[2px] text-[#00355F] flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-grow">
                    <div className="flex gap-2 items-center">
                      <strong className="text-[16px] font-[700] text-[#0D1C2E] font-sans truncate">Primary Coverage</strong>
                      <span className="px-2 py-0.5 bg-[#D4E6E5] text-[#576867] rounded-[2px] text-[10px] uppercase font-[700]">
                        ACTIVE
                      </span>
                    </div>
                    <span className="text-[16px] font-[400] text-[#42474F] mt-1">
                      Member ID: BCBS-992011033
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal & Actions */}
              <div className="flex flex-col gap-6 w-full h-[150.25px]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 border border-[#727780] rounded-[2px] mt-0.5 text-[#00355F] cursor-pointer"
                    defaultChecked
                  />
                  <span className="text-[14px] leading-[23px] text-[#42474F] font-[400]">
                    I authorize Clinq Healthcare to verify insurance benefits and schedule the appointment.
                  </span>
                </label>

                <div className="flex gap-4 items-center w-full h-[58px] mt-2">
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 h-[56px] bg-[#00355F] hover:bg-[#002645] text-white text-[16px] font-[700] rounded-[4px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] uppercase transition-colors cursor-pointer select-none"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="w-[207.67px] h-[58px] border border-[#00355F] hover:bg-[#EFF4FF] text-[#00355F] text-[16px] font-[700] rounded-[4px] uppercase transition-colors cursor-pointer select-none"
                  >
                    Go Back
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Summary Card (Width 380px) */}
            <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0 relative lg:sticky lg:top-5">
              
              {/* Booking Summary Card */}
              <div className="bg-white border border-[#C2C7D1] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg overflow-hidden w-full h-[462px] flex flex-col">
                <div className="bg-[#0F4C81] p-6 flex flex-col gap-1 w-full h-[100px] justify-center">
                  <span className="text-[16px] font-[400] tracking-[3.2px] text-white/80 uppercase">
                    BOOKING SUMMARY
                  </span>
                  <h4 className="text-[16px] font-[400] text-[#8EBDF9] font-sans">
                    Appointment Details
                  </h4>
                </div>

                <div className="p-6 flex flex-col gap-6 flex-grow">
                  {/* Specialist */}
                  <div className="flex gap-4 items-center w-full h-[64px]">
                    <div className="w-16 h-16 bg-[#D5E3FC] border-2 border-[#C2C7D1] rounded-[12px] flex items-center justify-center shrink-0 text-[#00355F] font-[800] text-[18px]">
                      {selectedDoctor?.initials || "AT"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <strong className="text-[16px] font-[700] text-[#0D1C2E] font-sans">{selectedDoctor?.name || 'Dr. Aris Thorne'}</strong>
                      <span className="text-[14px] text-[#42474F] mt-1">{selectedDoctor?.specialty}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#C2C7D1] w-full" />

                  {/* Dates & Times */}
                  <div className="flex flex-col gap-3 w-full">
                    {/* Row 1 Date */}
                    <div className="flex gap-3 items-start w-full">
                      <div className="w-5 h-5 flex items-center justify-center text-[#0F4C81] shrink-0 mt-0.5">
                        <Clock className="w-[18px] h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans">{dateMap[selectedDate]}</strong>
                        <span className="text-[14px] text-[#42474F] mt-0.5">{selectedTime} EST</span>
                      </div>
                    </div>

                    {/* Row 2 Visit Type */}
                    <div className="flex gap-3 items-start w-full mt-1">
                      <div className="w-5 h-5 flex items-center justify-center text-[#0F4C81] shrink-0 mt-0.5">
                        {visitType === "In-Person" ? (
                          <MapPin className="w-4 h-5" />
                        ) : (
                          <Video className="w-[18px] h-5" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-[16px] font-[600] text-[#0D1C2E] font-sans">
                          {visitType === "In-Person" ? "In-Person Consult" : "Telehealth Consultation"}
                        </strong>
                        <span className="text-[14px] text-[#42474F] mt-0.5 leading-normal">
                          {visitType === "In-Person"
                            ? "MedCore Plaza, Suite 402"
                            : "Secure video email invitation format"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Co-pay amount block */}
                  <div className="bg-[#E6EEFF] rounded-[4px] p-4 flex flex-col justify-between w-full h-[75px] shrink-0 mt-2">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[14px] text-[#42474F]">Est. Co-pay</span>
                      <strong className="text-[16px] font-[700] text-[#0D1C2E] font-sans">$20.00</strong>
                    </div>
                    <span className="text-[10px] text-[#42474F] leading-none">
                      Final amount determined by provider at check-in.
                    </span>
                  </div>

                </div>
              </div>

              {/* Help Widget */}
              <div className="bg-[#EFF4FF] border border-[#C2C7D1]/20 rounded-[4px] p-4 flex gap-3 h-[72px] items-center w-full">
                <div className="w-10 h-10 bg-transparent flex items-center justify-center shrink-0 text-[#00355F]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <strong className="text-[16px] font-[700] text-[#0D1C2E] font-sans leading-none">Need assistance?</strong>
                  <span className="text-[11px] text-[#42474F] mt-2">
                    Call support at (800) 555-0199
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </section>

    </div>
  );

  // Helper toggle language
  function handleToggleLanguage(lang: string) {
    if (filterLanguage.includes(lang)) {
      setFilterLanguage(filterLanguage.filter((l) => l !== lang));
    } else {
      setFilterLanguage([...filterLanguage, lang]);
    }
  }

  // Helper reset filters
  function handleResetFilters() {
    setFilterTodayOnly(false);
    setFilterGender("Any");
    setFilterLanguage(["English"]);
  }
}
