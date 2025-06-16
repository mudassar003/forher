// src/lib/salesforce.ts
interface WeightLossLeadData {
  Name: string; // Standard Name field for list view
  Full_Name__c?: string;
  Email__c?: string; // Optional email field
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

  /**
   * Login to Salesforce using SOAP API (simple username/password)
   */
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
      throw new Error(`SOAP login failed: ${response.status}`);
    }

    const responseText = await response.text();
    
    // Extract session ID and server URL from SOAP response
    const sessionIdMatch = responseText.match(/<sessionId>([^<]+)<\/sessionId>/);
    const serverUrlMatch = responseText.match(/<serverUrl>([^<]+)<\/serverUrl>/);
    
    if (!sessionIdMatch || !serverUrlMatch) {
      throw new Error('Failed to extract session info from SOAP response');
    }

    return {
      sessionId: sessionIdMatch[1],
      serverUrl: serverUrlMatch[1]
    };
  }

  /**
   * Create Weight Loss Lead using REST API
   */
  async createWeightLossLead(leadData: WeightLossLeadData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Login to get session
      const { sessionId, serverUrl } = await this.login();
      
      // Extract base URL from server URL
      const baseUrl = serverUrl.replace(/\/services\/Soap\/c\/[\d.]+.*/, '');
      
      // Create lead using REST API
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
        const errorData = await response.json();
        throw new Error(`Failed to create lead: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return {
        success: true,
        id: result.id
      };

    } catch (error) {
      console.error('Error creating Salesforce lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Transform form data to Salesforce lead
   */
  transformFormDataToLead(formData: Record<string, any>, contactInfo?: any): WeightLossLeadData {
    const fullName = contactInfo?.name || 'Unknown User';
    
    // Parse height
    let heightFeet: number | undefined;
    let heightInches: number | undefined;
    if (formData.height) {
      try {
        const heightData = typeof formData.height === 'string' 
          ? JSON.parse(formData.height) 
          : formData.height;
        heightFeet = heightData.feet ? parseInt(heightData.feet) : undefined;
        heightInches = heightData.inches !== undefined ? parseInt(heightData.inches) : undefined;
      } catch (error) {
        console.warn('Error parsing height:', error);
      }
    }

    // Calculate BMI
    let bmi: number | undefined;
    if (formData['current-weight'] && heightFeet && heightInches !== undefined) {
      const weightInLbs = parseFloat(formData['current-weight']);
      const totalInches = (heightFeet * 12) + heightInches;
      const weightInKg = weightInLbs * 0.453592;
      const heightInMeters = totalInches * 0.0254;
      bmi = Math.round((weightInKg / (heightInMeters * heightInMeters)) * 100) / 100;
    }

    // Transform medical conditions
    let medicalConditions: string | undefined;
    if (Array.isArray(formData['medical-conditions'])) {
      const conditions = formData['medical-conditions'].filter((c: string) => c !== 'none');
      medicalConditions = conditions.length > 0 ? conditions.join(', ') : undefined;
    }

    return {
      Name: `Weight Loss Lead - ${fullName}`, // Standard Name field for list view
      Full_Name__c: fullName,
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