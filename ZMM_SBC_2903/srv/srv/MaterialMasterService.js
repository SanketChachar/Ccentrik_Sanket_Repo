/*
 * *Begin of Changes by Sanket, 28/03/2026*
 * Purpose: Validation for ZMARA entity.
 *          Restricts MTART, MBRSH, MATKL, PSTAT to allowed values only.
 *          Auto-sets LAEDA (last change date) on create and update.
 *          Validates FK: MATNR must exist in ZMARA before adding ZMARC/ZMARD.
 */

const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {

    const { ZMARA, ZMARC, ZMARD } = srv.entities;

    // ── Allowed value lists (from your Excel / sir's plan) ────────
    const VALID = {
        MTART : ['S', 'L', 'G'],             // S=SOLID, L=LIQUID, G=GAS
        MBRSH : ['MN','PH','IN','HM','MK'],  // Industry sectors
        MATKL : ['PL','IR','EL','OT','MD'],  // Material groups
        PSTAT : ['R', 'U', 'S'],             // R=RAW, U=USE, S=SELL
        MMSTA : ['W', 'B'],                  // W=Working, B=Broken
    };

    // ── HELPER: validate a single field ───────────────────────────
    function validateField(req, value, validList, fieldName, fieldMeaning) {
        if (value && !validList.includes(value)) {
            req.error(400,
                `Invalid ${fieldName}: '${value}'. Allowed values: ${validList.join(', ')}` +
                ` (${fieldMeaning})`
            );
        }
    }

    // ══════════════════════════════════════════════════════
    // ZMARA – BEFORE CREATE: Validate all fields
    // ══════════════════════════════════════════════════════
    srv.before('CREATE', ZMARA, async (req) => {
        const d = req.data;

        // 1. MATNR is mandatory
        if (!d.MATNR || d.MATNR.trim() === '') {
            req.error(400, 'MATNR (Material Number) is required and cannot be empty.');
            return;
        }

        // 2. Check for duplicate MATNR
        const existing = await SELECT.one.from(ZMARA).where({ MATNR: d.MATNR });
        if (existing) {
            req.error(409, `Material ${d.MATNR} already exists. Use UPDATE to change it.`);
            return;
        }

        // 3. Validate all restricted fields
        validateField(req, d.MTART, VALID.MTART, 'MTART', 'S=SOLID L=LIQUID G=GAS');
        validateField(req, d.MBRSH, VALID.MBRSH, 'MBRSH', 'MN=MANUF PH=PHARMA IN=INDUSTRIAL HM=HOME MK=MEDICINE');
        validateField(req, d.MATKL, VALID.MATKL, 'MATKL', 'PL=PLASTICS IR=IRON EL=ELECTRICITY OT=OTHERS MD=MEDICINE');
        validateField(req, d.PSTAT, VALID.PSTAT, 'PSTAT', 'R=RAW U=USE S=SELL');
    });

    // ══════════════════════════════════════════════════════
    // ZMARA – BEFORE UPDATE: Validate changed fields
    // ══════════════════════════════════════════════════════
    srv.before('UPDATE', ZMARA, async (req) => {
        const d = req.data;
        validateField(req, d.MTART, VALID.MTART, 'MTART', 'S=SOLID L=LIQUID G=GAS');
        validateField(req, d.MBRSH, VALID.MBRSH, 'MBRSH', 'MN=MANUF PH=PHARMA IN=INDUSTRIAL HM=HOME MK=MEDICINE');
        validateField(req, d.MATKL, VALID.MATKL, 'MATKL', 'PL=PLASTICS IR=IRON EL=ELECTRICITY OT=OTHERS MD=MEDICINE');
        validateField(req, d.PSTAT, VALID.PSTAT, 'PSTAT', 'R=RAW U=USE S=SELL');
    });

    // ══════════════════════════════════════════════════════
    // ZMARA – AFTER CREATE & UPDATE: Auto-set LAEDA = today
    // ══════════════════════════════════════════════════════
    const setToday = async (result, req) => {
        const today = new Date().toISOString().split('T')[0]; // e.g. 2026-03-28
        const matnr = result?.MATNR || req.data?.MATNR;
        if (matnr) {
            await UPDATE(ZMARA).set({ LAEDA: today }).where({ MATNR: matnr });
            console.log(`[ZMARA] LAEDA set to ${today} for MATNR: ${matnr}`);
        }
    };
    srv.after('CREATE', ZMARA, setToday);
    srv.after('UPDATE', ZMARA, setToday);

    // ══════════════════════════════════════════════════════
    // ZMARC – BEFORE CREATE: Validate FK + MMSTA
    // MATNR in ZMARC must exist in ZMARA first!
    // ══════════════════════════════════════════════════════
    srv.before('CREATE', ZMARC, async (req) => {
        const d = req.data;

        // FK Check: Does this MATNR exist in ZMARA?
        if (d.MATNR) {
            const parent = await SELECT.one.from(ZMARA).where({ MATNR: d.MATNR });
            if (!parent) {
                req.error(404,
                    `Cannot add ZMARC: Material '${d.MATNR}' does not exist in ZMARA. ` +
                    `Create the material in ZMARA first.`
                );
                return;
            }
        }

        // Validate MMSTA
        validateField(req, d.MMSTA, VALID.MMSTA, 'MMSTA', 'W=Working B=Broken');
    });

    // ══════════════════════════════════════════════════════
    // ZMARD – BEFORE CREATE: Validate FK
    // MATNR in ZMARD must exist in ZMARA first!
    // ══════════════════════════════════════════════════════
    srv.before('CREATE', ZMARD, async (req) => {
        const d = req.data;

        if (d.MATNR) {
            const parent = await SELECT.one.from(ZMARA).where({ MATNR: d.MATNR });
            if (!parent) {
                req.error(404,
                    `Cannot add ZMARD: Material '${d.MATNR}' does not exist in ZMARA.`
                );
                return;
            }
        }
    });

    // ══════════════════════════════════════════════════════
    // DISPLAY TRANSACTION – Custom READ with filters
    // ══════════════════════════════════════════════════════
    srv.on('READ', 'ZMARA_Display', async (req) => {
        const results = await SELECT.from('ZMM_SBC_2803.ZMARA');
        console.log(`[D_ZMARA] Displayed ${results.length} material(s)`);
        return results;
    });

});

// *End of Changes by Sanket, 28/03/2026*
