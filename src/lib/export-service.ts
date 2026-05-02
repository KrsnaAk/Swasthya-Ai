import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  patient: {
    name: string;
    age: number | string;
    gender: string;
    abhaId?: string;
  };
  records: {
    bloodGroup?: string;
    allergies?: string;
    existingDiseases?: string;
    medications?: string;
    pastSurgeries?: string;
    vaccinationNotes?: string;
  };
  latestTriage?: {
    date: string;
    symptoms: string;
    severity: string;
  } | null;
}

const DISCLAIMER = "DISCLAIMER: This summary is generated from user-provided data and is not a medical diagnosis. Always consult a healthcare professional for clinical decisions.";

export const exportToPDF = async (data: ExportData) => {
  console.log("PDF export clicked", data);
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 109, 119); // Deep Teal
  doc.text("SwasthyaAI Health Summary", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${timestamp}`, 14, 30);

  // Patient Info
  autoTable(doc, {
    startY: 35,
    head: [['Patient Identification', 'Details']],
    body: [
      ['Full Name', data.patient.name || 'Not provided'],
      ['Age / Gender', `${data.patient.age || 'N/A'} / ${data.patient.gender || 'N/A'}`],
      ['Patient ID', data.patient.abhaId || 'Not provided'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 109, 119] }
  });

  // Clinical Profile
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Clinical Category', 'Patient Records']],
    body: [
      ['Blood Group', data.records.bloodGroup || 'Not provided'],
      ['Chronic Conditions', data.records.existingDiseases || 'Not provided'],
      ['Known Allergies', data.records.allergies || 'Not provided'],
      ['Current Medications', data.records.medications || 'Not provided'],
      ['Past Surgeries', data.records.pastSurgeries || 'Not provided'],
      ['Vaccination Notes', data.records.vaccinationNotes || 'Not provided'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 166, 180] } // Medical Cyan
  });

  // Latest Triage if available
  if (data.latestTriage) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Latest Triage Assessment', 'Result']],
      body: [
        ['Date', data.latestTriage.date],
        ['Symptoms Reported', data.latestTriage.symptoms],
        ['Clinical Severity', data.latestTriage.severity.toUpperCase()],
      ],
      headStyles: { fillColor: [211, 47, 47] } // Emergency Red for emphasis
    });
  }

  // Footer Disclaimer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(150);
  const splitDisclaimer = doc.splitTextToSize(DISCLAIMER, 180);
  doc.text(splitDisclaimer, 14, finalY);

  doc.save("swasthyaai_health_summary.pdf");
  console.log("PDF generated successfully");
};

export const exportToJSON = (data: ExportData) => {
  console.log("JSON export clicked", data);
  const fhirPatient = {
    resourceType: "Patient",
    id: data.patient.abhaId?.replace(/-/g, '') || "unknown",
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
      lastUpdated: new Date().toISOString()
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
        valueString: "Not specified"
      }
    ],
    name: [{ text: data.patient.name }],
    gender: data.patient.gender?.toLowerCase() || "unknown",
    birthDate: data.patient.age ? new Date(new Date().getFullYear() - Number(data.patient.age), 0, 1).toISOString().split('T')[0] : undefined,
    clinicalContext: {
      bloodGroup: data.records.bloodGroup,
      chronicConditions: data.records.existingDiseases,
      medications: data.records.medications,
      allergies: data.records.allergies,
      surgeries: data.records.pastSurgeries,
      vaccinations: data.records.vaccinationNotes,
      latestTriage: data.latestTriage
    },
    disclaimer: DISCLAIMER,
    generatedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(fhirPatient, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = "swasthyaai_fhir_export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log("JSON generated successfully");
};
