/* Begin of change by Sanket, 29/03/2026
    purpose : Expose ZMARA, ZMARC, ZMARD, ZMAKTX as OData V4 endpoints
    Change endpoints support full CRUD
    display endpoints are read-only
     */

using {ZMM_SBC_2903 as db} from '../db/zmara_schema';

service MaterialMasterService {

    //Change Transaction (CT_ZMARA).
    //Full Create,Read,Update and Delete allowed
    @cds.redirection.target   // ← ADD THIS ONE LINE – tells CAP "this is the main ZMARA"
    entity ZMARA as projection on db.ZMARA;
    entity ZMARC as projection on db.ZMARC;
    @cds.redirection.target   // ← ADD THIS ONE LINE – tells CAP "this is the main ZMARD"
    entity ZMARD as projection on db.ZMARD;
    entity ZMAKTX as  projection on db.ZMAKTX;

    //Display Transaction (DT_ZMARA).
    //Read only no change allowed.
    
    @readonly
    entity ZMARA_Display as projection on db.ZMARA;

    @readonly
    entity ZMARD_Display as projection on db.ZMARD;
}

//End of Changes by Sanket, 29/03/2026