/* Begin of change by Sanket, 29/03/2026
    purpose : complete material master schema with PK, FK, and cardinality
    Entities: ZMARA, ZMARD, ZMARC, ZMAKTX
     */

namespace ZMM_SBC_2903;

// ZMARA : Material Master (Main/Parent table)
// PK : MATNR
// This is the root table all other table ref this.

entity ZMARA {
   
   key MATNR : String(20); //Material Number, Primary Key(PK).
       MTART : String(1); //Material Type, S=Solid,L=Liquid,G=Gas.
       MBRSH : String(2); //MN=Manuf, PH=Pharma,IN=Industrial,HM=Home,MK=Medicine.
       LAEDA : Date;      //Date of last change.
       MATKL : String(2); //Material Group, PL=Plastics,IR=Iron,EL=Electricity, OT=Others, MD=Medicine.
       PSTAT :String(1);  //Status, R=Raw, U=Use, S=Sell.

       //Cardinality: ZMARA (1) ────> ZMARC (N).
       //So one material can be in many plants.
       toZMARC : Association to many ZMARC on toZMARC.MATNR = $self.MATNR;

       //Cardinality: ZMARA (1) ──── ZMARD (N).
       //So one material can have many stock entries
       toZMARD : Association to many ZMARD on toZMARD.MATNR = $self.MATNR;

       //Cardinality: ZMARA (1) ──── ZMAKTX (N) ───────────────
       //so one material can have text in many languages
       toZMAKTX : Association to many ZMAKTX on toZMAKTX.MATNR = $self.MATNR;
}


//ZMARC: Plant Material (Child Table 1).
//PK: MATNR + WERKS (Composite Key).
//FK: MATNR --> reference ZMARA.MATNR.
//Cardinality :MARA(1) to ZMARC (N).

entity ZMARC{

   key MATNR : String(20); //FK-->ZMARA.MATNR.
   key WERKS : String(4);  //Plant Code (eg. 201,202, etc..).
       MMSTA : String(1);  //Plant Status : W=Working, B=Broken.

//FK back-reference to ZMARA
   
   toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;

}



//ZMARD : Material Stock(Child Table 2).
//PK: MATNR + WERKS + LGORT (Composite Key).
//FK: MATNR → ZMARA.MATNR
//Cardinality: ZMARA (1) to ZMARD (N)

entity ZMARD {
    key MATNR : String(20);    // FK → ZMARA.MATNR
    key WERKS : String(4);     // Plant Code
    key LGORT : String(10);    // Storage Location (e.g. RM1, KRM1)

        // FK back-reference to ZMARA
        toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;
}

// ZMAKTX – Material Text (Language Table)
// PK: MATNR + SPRAS (composite key)
// FK: MATNR → ZMARA.MATNR

entity ZMAKTX {
    key MATNR : String(20);    // FK → ZMARA.MATNR
    key SPRAS : String(2);     // Language: EN=English
        MAKTX : String(100);   // Material Description (human-readable name)

        // FK back-reference to ZMARA
        toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;
}


//End of Changes by Sanket, 29/03/2026
