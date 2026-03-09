# Memory Input UI Prototype

Standalone UI prototype for:

- Internal listing management (own inventory)
- Buyer requirement management
- External Naver ad feed inbox (sheet-driven)
- AI decision queue for recommendation/verification
- Follow-up task inbox
- Data source setup page

## Run

```bash
cd /Users/hyunsulee/estate-crm/apps/memory-input-ui
python3 -m http.server 4173
```

Then open:

- [http://localhost:4173](http://localhost:4173)

## Notes

- "Blue row = new data" is represented with row background `FFE5F2FF`.
- This is a UI-only prototype (no backend/MCP wiring yet).
