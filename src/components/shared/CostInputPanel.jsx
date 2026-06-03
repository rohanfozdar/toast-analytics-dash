import { useState } from 'react';
import useDashboardStore from '../../store/useDashboardStore';
import { getLaborPct } from '../../lib/calculations';

export default function CostInputPanel({ checks, timeEntries }) {
  const [expanded, setExpanded] = useState(true);
  const { start, end } = useDashboardStore(s => s.dateRange);
  const costInputs = useDashboardStore(s => s.costInputs);
  const setCostInputs = useDashboardStore(s => s.actions.setCostInputs);

  const laborPct = getLaborPct(timeEntries, checks, start, end);

  return (
    <div>
      <button onClick={() => setExpanded(e => !e)}>
        {expanded ? 'Collapse' : 'Expand'} Cost Inputs
      </button>
      {expanded && (
        <div>
          <div data-role="cost-notice">
            <p>This section requires your input.</p>
            <p>
              Toast POS does not capture food costs, rent, utilities, or supply costs.
              Labor cost below is calculated automatically from your staff clock-in data.
              All other cost fields must be entered by you for margin calculations to
              reflect your actual business. These figures are stored locally in your
              browser session and are not saved permanently.
            </p>
          </div>

          <div>
            <label>
              Food cost % of revenue
              <input
                type="number"
                min="0"
                max="100"
                value={costInputs.foodCostPct}
                onChange={e => setCostInputs({ foodCostPct: Number(e.target.value) })}
              />
              <span>%</span>
            </label>
          </div>

          <div>
            <label>
              Fixed costs per week
              <span>$</span>
              <input
                type="number"
                min="0"
                value={costInputs.fixedWeeklyCost}
                onChange={e => setCostInputs({ fixedWeeklyCost: Number(e.target.value) })}
              />
            </label>
          </div>

          <div>
            <label>
              Variable costs % of revenue
              <input
                type="number"
                min="0"
                max="100"
                value={costInputs.variableCostPct}
                onChange={e => setCostInputs({ variableCostPct: Number(e.target.value) })}
              />
              <span>%</span>
            </label>
          </div>

          <div>
            Labor cost % (from TimeEntries data):&nbsp;
            <span data-alert={laborPct > 35 ? 'true' : undefined}>
              {laborPct}
            </span>%
          </div>
        </div>
      )}
    </div>
  );
}
