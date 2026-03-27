using {sap.materialMaster as db} from '../db/zmara_schema';

service MaterialMasterService {
    
    entity MaterialMaster as projection on db.MaterialMaster;
        
    }
    

