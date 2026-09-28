import { jsPDF } from 'jspdf';
import { UserProfile, MealLog, WorkoutCompletionLog, BodyMetric } from '../types';

export interface PDFExportOptions {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutCompletionLog[];
  bodyMetrics?: BodyMetric[];
  startDate?: string;
  endDate?: string;
  includeMeals?: boolean;
  includeWorkouts?: boolean;
  includeMetrics?: boolean;
  includeProfile?: boolean;
  autoSave?: boolean;
}

/**
 * Client-Side Offline PDF Exporter for AROH
 * Operates 100% offline without any server calls or remote API dependencies.
 * Creates an authoritative, sovereign static backup of athlete workouts and nutrition logs.
 */
export function exportUserDataToPDF(options: PDFExportOptions): { filename: string; doc: jsPDF } {
  const {
    userProfile,
    mealLogs = [],
    workoutLogs = [],
    bodyMetrics = [],
    startDate,
    endDate,
    includeMeals = true,
    includeWorkouts = true,
    includeMetrics = true,
    includeProfile = true,
    autoSave = true,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 155);
    doc.text('AROH • Offline Athlete Report & Sovereign Backup', margin, cursorY);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, cursorY, { align: 'right' });
    cursorY += 4;
    doc.setDrawColor(220, 226, 235);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;
  };

  const checkPageBreak = (neededHeight: number, onBreak?: () => void) => {
    if (cursorY + neededHeight > pageHeight - 16) {
      doc.addPage();
      cursorY = margin;
      drawPageHeader();
      if (onBreak) {
        onBreak();
      }
    }
  };

  // Filter items by active date range
  const filterByDate = <T extends { date?: string; createdAt?: string }>(items: T[]): T[] => {
    return items.filter((item) => {
      const itemDate = item.date || (item.createdAt ? item.createdAt.split('T')[0] : '');
      if (!itemDate) return true;
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  const filteredMeals = filterByDate(mealLogs).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const filteredWorkouts = filterByDate(workoutLogs).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const filteredMetrics = filterByDate(bodyMetrics).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // ==========================================
  // TITLE HEADER BANNER
  // ==========================================
  doc.setFillColor(15, 23, 42); // #0F172A slate-900
  doc.roundedRect(margin, cursorY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('AROH ATHLETE DOSSIER', margin + 6, cursorY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text('OFFLINE STATIC BACKUP & PROGRESSION REPORT', margin + 6, cursorY + 16);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const statusNotice = typeof navigator !== 'undefined' && !navigator.onLine ? 'Generated [Offline Mode]' : 'Local Storage Sovereign Export';
  doc.text(statusNotice, pageWidth - margin - 6, cursorY + 9, { align: 'right' });
  doc.text(`Exported: ${new Date().toLocaleString()}`, pageWidth - margin - 6, cursorY + 16, { align: 'right' });

  cursorY += 30;

  // ==========================================
  // ATHLETE PROFILE SUMMARY
  // ==========================================
  if (includeProfile) {
    checkPageBreak(38);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, cursorY, contentWidth, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('1. ATHLETE PROFILE & METABOLIC BASELINE', margin + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const col1X = margin + 4;
    const col2X = margin + 50;
    const col3X = margin + 100;
    const col4X = margin + 145;

    // Row 1
    doc.text(`Name: ${userProfile.name || 'Athlete'}`, col1X, cursorY + 13);
    doc.text(`Email: ${userProfile.email || 'Local User'}`, col2X, cursorY + 13);
    doc.text(`Goal: ${(userProfile.goal || 'General Fitness').replace(/_/g, ' ').toUpperCase()}`, col3X, cursorY + 13);
    doc.text(`Weight: ${userProfile.weightKg || '--'} kg`, col4X, cursorY + 13);

    // Row 2
    const targetProtein = userProfile.dailyProtein || (userProfile as any).proteinTargetG || '--';
    const dietPref = userProfile.dietType || (userProfile as any).dietaryPreference || 'Any';
    doc.text(`Target Calories: ${userProfile.dailyCalories || 2000} kcal`, col1X, cursorY + 20);
    doc.text(`Target Protein: ${targetProtein} g`, col2X, cursorY + 20);
    doc.text(`Diet Preference: ${String(dietPref).replace(/_/g, ' ').toUpperCase()}`, col3X, cursorY + 20);
    doc.text(`Target Weight: ${userProfile.targetWeightKg || '--'} kg`, col4X, cursorY + 20);

    // Row 3
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const rangeText = startDate || endDate ? `Date Filter Range: ${startDate || 'Earliest'} to ${endDate || 'Latest'}` : 'Date Filter: Lifetime Complete History';
    doc.text(rangeText, col1X, cursorY + 27);
    doc.text(`Nutrition Records: ${filteredMeals.length}  |  Workout Sessions: ${filteredWorkouts.length}  |  Body Metric Logs: ${filteredMetrics.length}`, col3X, cursorY + 27);

    cursorY += 38;
  }

  // ==========================================
  // NUTRITION & MEAL LOGS
  // ==========================================
  if (includeMeals) {
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`2. NUTRITION & MACRONUTRIENT LOGS (${filteredMeals.length} Entries)`, margin, cursorY);
    cursorY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Nutrient values calculated from verified ICMR-IFCT & USDA standard tables. AI estimates confirmed by cooked portion grams.', margin, cursorY);
    cursorY += 4;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    doc.text('Date', margin + 2, cursorY + 4.2);
    doc.text('Meal / Food Description', margin + 24, cursorY + 4.2);
    doc.text('Grams', margin + 110, cursorY + 4.2, { align: 'right' });
    doc.text('Calories', margin + 128, cursorY + 4.2, { align: 'right' });
    doc.text('Protein', margin + 145, cursorY + 4.2, { align: 'right' });
    doc.text('Carbs', margin + 162, cursorY + 4.2, { align: 'right' });
    doc.text('Fat', margin + 178, cursorY + 4.2, { align: 'right' });

    cursorY += 7;

    if (filteredMeals.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('No meal logs recorded for the selected timeframe.', margin + 2, cursorY + 3);
      cursorY += 8;
    } else {
      filteredMeals.forEach((meal, idx) => {
        checkPageBreak(12);

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, cursorY - 1, contentWidth, 6.5, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);

        // Date
        doc.text(meal.date || '--', margin + 2, cursorY + 3.2);

        // Title & items
        const itemNames = (meal.items || []).map((i) => `${i.name} (${i.weightG || 100}g)`).join(', ');
        const desc = itemNames || meal.userNotes || 'Standard Meal';
        const truncatedDesc = desc.length > 55 ? `${desc.slice(0, 52)}...` : desc;
        doc.text(truncatedDesc, margin + 24, cursorY + 3.2);

        // Grams
        const totalGrams = (meal.items || []).reduce((acc, i) => acc + (Number(i.weightG) || 0), 0);
        doc.text(totalGrams > 0 ? `${totalGrams}g` : '--', margin + 110, cursorY + 3.2, { align: 'right' });

        // Macros
        doc.setFont('helvetica', 'bold');
        doc.text(`${Math.round(meal.calories || 0)}`, margin + 128, cursorY + 3.2, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(`${Number(meal.proteinG || 0).toFixed(1)}g`, margin + 145, cursorY + 3.2, { align: 'right' });
        doc.text(`${Number(meal.carbsG || 0).toFixed(1)}g`, margin + 162, cursorY + 3.2, { align: 'right' });
        doc.text(`${Number(meal.fatG || 0).toFixed(1)}g`, margin + 178, cursorY + 3.2, { align: 'right' });

        cursorY += 6.5;
      });
      cursorY += 5;
    }
  }

  // ==========================================
  // WORKOUT & PROGRESSION LOGS
  // ==========================================
  if (includeWorkouts) {
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`3. RESISTANCE TRAINING & WORKOUT LOGS (${filteredWorkouts.length} Sessions)`, margin, cursorY);
    cursorY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Progressive overload volume and exercise mechanical logs.', margin, cursorY);
    cursorY += 4;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    doc.text('Date', margin + 2, cursorY + 4.2);
    doc.text('Session / Split Routine', margin + 24, cursorY + 4.2);
    doc.text('Duration', margin + 95, cursorY + 4.2, { align: 'right' });
    doc.text('Total Sets', margin + 115, cursorY + 4.2, { align: 'right' });
    doc.text('Load Volume', margin + 140, cursorY + 4.2, { align: 'right' });
    doc.text('Completed Exercises', margin + 145, cursorY + 4.2);

    cursorY += 7;

    if (filteredWorkouts.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('No workout sessions logged for the selected timeframe.', margin + 2, cursorY + 3);
      cursorY += 8;
    } else {
      filteredWorkouts.forEach((workout, idx) => {
        checkPageBreak(12);

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, cursorY - 1, contentWidth, 6.5, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);

        // Date
        doc.text(workout.date || '--', margin + 2, cursorY + 3.2);

        // Title
        const routineName = workout.dayName || (workout as any).workoutTitle || 'Full Body Session';
        const truncatedRoutine = routineName.length > 40 ? `${routineName.slice(0, 37)}...` : routineName;
        doc.text(truncatedRoutine, margin + 24, cursorY + 3.2);

        // Duration & Sets
        doc.text(`${workout.durationMin || 45}m`, margin + 95, cursorY + 3.2, { align: 'right' });
        const totalSets = (workout.loggedExercises || []).reduce((acc, e) => acc + (Number(e.sets) || 0), 0);
        doc.text(`${totalSets || '--'}`, margin + 115, cursorY + 3.2, { align: 'right' });
        doc.text(workout.totalVolumeKg ? `${workout.totalVolumeKg}kg` : '--', margin + 140, cursorY + 3.2, { align: 'right' });

        // Exercise summary
        const exSummary = (workout.loggedExercises || [])
          .map((e) => `${e.exerciseName || 'Exercise'} (${e.sets || 3}x${e.reps || 10})`)
          .join(', ');
        const truncatedEx = exSummary.length > 25 ? `${exSummary.slice(0, 22)}...` : exSummary;
        doc.text(truncatedEx || 'Custom Movements', margin + 145, cursorY + 3.2);

        cursorY += 6.5;
      });
      cursorY += 5;
    }
  }

  // ==========================================
  // BODY COMPOSITION & METRIC LOGS
  // ==========================================
  if (includeMetrics && filteredMetrics.length > 0) {
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`4. PHYSIOLOGICAL MEASUREMENTS (${filteredMetrics.length} Records)`, margin, cursorY);
    cursorY += 4;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    doc.text('Date', margin + 2, cursorY + 4.2);
    doc.text('Weight (kg)', margin + 35, cursorY + 4.2);
    doc.text('Body Fat %', margin + 75, cursorY + 4.2);
    doc.text('Waist (cm)', margin + 115, cursorY + 4.2);
    doc.text('Notes / Context', margin + 150, cursorY + 4.2);

    cursorY += 7;

    filteredMetrics.forEach((metric, idx) => {
      checkPageBreak(8);

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY - 1, contentWidth, 6, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      doc.text(metric.date || '--', margin + 2, cursorY + 3.2);
      doc.text(metric.weightKg ? `${metric.weightKg} kg` : '--', margin + 35, cursorY + 3.2);
      doc.text(metric.bodyFatPct ? `${metric.bodyFatPct}%` : '--', margin + 75, cursorY + 3.2);
      doc.text(metric.waistCm ? `${metric.waistCm} cm` : '--', margin + 115, cursorY + 3.2);
      const note = (metric.notes || '').length > 25 ? `${(metric.notes || '').slice(0, 22)}...` : metric.notes || '--';
      doc.text(note, margin + 150, cursorY + 3.2);

      cursorY += 6;
    });
    cursorY += 5;
  }

  // ==========================================
  // FOOTER & SOVEREIGN VERIFICATION
  // ==========================================
  checkPageBreak(18);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DATA SOVEREIGNTY & DPDP ACT COMPLIANCE', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  cursorY += 3.5;
  doc.text(
    'This document is an offline static backup generated directly inside your browser. No personal health records were transmitted to any third party.',
    margin,
    cursorY
  );
  cursorY += 3;
  doc.text(
    'Food table values derived from ICMR-IFCT (2017) and USDA FoodData Central. "AI estimate — confirm grams. A photo is not a lab."',
    margin,
    cursorY
  );

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.text('AROH AI • Private & Sovereign Health Record Backup', margin, pageHeight - 8);
  }

  // Save the PDF file to local device if requested
  const athleteCleanName = (userProfile.name || 'Athlete').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `AROH_Report_${athleteCleanName}_${dateStamp}.pdf`;
  if (autoSave) {
    try {
      doc.save(filename);
    } catch (err) {
      console.warn('doc.save deferred or unsupported in current environment', err);
    }
  }

  return { filename, doc };
}

/**
 * Generate PDF as Blob for previewing or offline storage without auto-downloading
 */
export function generateUserDataPDFBlob(options: PDFExportOptions): { filename: string; blob: Blob; doc: jsPDF } {
  const { filename, doc } = exportUserDataToPDF({ ...options, autoSave: false });
  const blob = doc.output('blob');
  return { filename, blob, doc };
}

/**
 * Trigger immediate browser download of an existing jsPDF document
 */
export function triggerPDFDownload(doc: jsPDF, filename: string): void {
  try {
    doc.save(filename);
  } catch (err) {
    console.warn('Failed to trigger download via doc.save:', err);
    // Fallback: create blob url and click hidden download anchor
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (fallbackErr) {
      console.error('All download mechanisms failed:', fallbackErr);
    }
  }
}
