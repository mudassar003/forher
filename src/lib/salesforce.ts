// src/lib/salesforce.ts
interface WeightLossLeadData {
  Name: string;
  Full_Name__c?: string;
  Email__c?: string;
  Phone__c?: string;
  Age_Group__c?: string;
  Is_Female__c?: string;
  Current_Weight__c?: number;
  Height_Feet__c?: number;
  Height_Inches__c?: number;
  BMI__c?: number;
  Is_Pregnant__c?: string;
  Is_Breastfeeding__c?: string;
  Medical_Conditions__c?: string;
  Takes_Prescription_Medications__c?: string;
  Has_Eating_Disorder__c?: string;
  Previous_Weight_Loss_Attempts__c?: string;
  Form_Submission_Date__c: string;
  Lead_Source__c: string;
}

class SalesforceService {
  private username: string;
  private password: string;
  private loginUrl: string;

  constructor() {
    this.username = process.env.SALESFORCE_USERNAME!;
    this.password = process.env.SALESFORCE_PASSWORD!;
    this.loginUrl = process.env.SALESFORCE_LOGIN_URL!;

    if (!this.username || !this.password || !this.loginUrl) {
      throw new Error('Missing Salesforce credentials');
    }
  }

  private async login(): Promise<{ sessionId: string; serverUrl: string }> {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:login>
         <urn:username>${this.username}</urn:username>
         <urn:password>${this.password}</urn:password>
      </urn:login>
   </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(`${this.loginUrl}/services/Soap/c/58.0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=UTF-8',
        'SOAPAction': 'login'
      },
      body: soapBody
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const responseText = await response.text();
    
    const sessionIdMatch = responseText.match(/<sessionId>([^<]+)<\/sessionId>/);
    const serverUrlMatch = responseText.match(/<serverUrl>([^<]+)<\/serverUrl>/);
    
    if (!sessionIdMatch || !serverUrlMatch) {
      throw new Error('Authentication failed');
    }

    return {
      sessionId: sessionIdMatch[1],
      serverUrl: serverUrlMatch[1]
    };
  }

  async createWeightLossLead(leadData: WeightLossLeadData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { sessionId, serverUrl } = await this.login();
      
      const baseUrl = serverUrl.replace(/\/services\/Soap\/c\/[\d.]+.*/, '');
      const createUrl = `${baseUrl}/services/data/v58.0/sobjects/Weight_Loss_Lead__c`;
      
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to create lead'
        };
      }

      const result = await response.json();
      return {
        success: true,
        id: result.id
      };

    } catch (error) {
      return {
        success: false,
        error: 'Service unavailable'
      };
    }
  }

  transformFormDataToLead(formData: Record<string, any>, contactInfo?: any): WeightLossLeadData {
    const fullName = contactInfo?.name || 'Unknown User';
    
    let heightFeet: number | undefined;
    let heightInches: number | undefined;
    if (formData.height) {
      try {
        const heightData = typeof formData.height === 'string' 
          ? JSON.parse(formData.height) 
          : formData.height;
        heightFeet = heightData.feet ? parseInt(heightData.feet) : undefined;
        heightInches = heightData.inches !== undefined ? parseInt(heightData.inches) : undefined;
      } catch {
        // Invalid height data
      }
    }

    let bmi: number | undefined;
    if (formData['current-weight'] && heightFeet && heightInches !== undefined) {
      const weightInLbs = parseFloat(formData['current-weight']);
      const totalInches = (heightFeet * 12) + heightInches;
      const weightInKg = weightInLbs * 0.453592;
      const heightInMeters = totalInches * 0.0254;
      bmi = Math.round((weightInKg / (heightInMeters * heightInMeters)) * 100) / 100;
    }

    let medicalConditions: string | undefined;
    if (Array.isArray(formData['medical-conditions'])) {
      const conditions = formData['medical-conditions'].filter((c: string) => c !== 'none');
      medicalConditions = conditions.length > 0 ? conditions.join(', ') : undefined;
    }

    return {
      Name: `Weight Loss Lead - ${fullName}`,
      Full_Name__c: fullName,
      Email__c: contactInfo?.email,
      Phone__c: contactInfo?.phone,
      Age_Group__c: formData['age-group'] === '55-plus' ? '55+' : formData['age-group'],
      Is_Female__c: formData.gender === 'yes' ? 'Yes' : formData.gender === 'no' ? 'No' : undefined,
      Current_Weight__c: formData['current-weight'] ? parseFloat(formData['current-weight']) : undefined,
      Height_Feet__c: heightFeet,
      Height_Inches__c: heightInches,
      BMI__c: bmi,
      Is_Pregnant__c: formData.pregnant === 'yes' ? 'Yes' : formData.pregnant === 'no' ? 'No' : undefined,
      Is_Breastfeeding__c: formData.breastfeeding === 'yes' ? 'Yes' : formData.breastfeeding === 'no' ? 'No' : undefined,
      Medical_Conditions__c: medicalConditions,
      Takes_Prescription_Medications__c: formData['prescription-medications'] === 'yes' ? 'Yes' : formData['prescription-medications'] === 'no' ? 'No' : undefined,
      Has_Eating_Disorder__c: formData['eating-disorder'] === 'yes' ? 'Yes' : formData['eating-disorder'] === 'no' ? 'No' : undefined,
      Previous_Weight_Loss_Attempts__c: formData['previous-weight-loss'],
      Form_Submission_Date__c: new Date().toISOString(),
      Lead_Source__c: 'Weight Loss Form'
    };
  }
}

export const salesforceService = new SalesforceService();