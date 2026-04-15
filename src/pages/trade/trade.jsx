import { useState, useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Content } from "../../components/layout";
import { Button } from "../../components/buttons";
import {
  useGetLeagueRostersQuery,
  useGetLeagueDraftPicksQuery,
  useCalculateTradeMutation,
  useFindDealsMutation,
  useGetRecommendedTradesMutation,
  useGetPlayersAllQuery,
} from "../../api/bfbApi";
import { useGetUsersQuery } from "../../api/api";
import {
  selectLeagueId,
  selectLeagueYear,
} from "../../api/selectors/leagueSelectors";
import filter from "lodash/filter";
import Icon from "@mdi/react";
import {
  mdiClose,
  mdiArrowRight,
  mdiRefresh,
  mdiCheck,
  mdiMagnify,
  mdiSwapHorizontal,
  mdiAutoFix,
} from "@mdi/js";
import "./trade.scss";

const MARGIN_LABELS = {
  even: "Even",
  slight: "Slight Edge",
  moderate: "Moderate Edge",
  significant: "Significant Edge",
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ avatarId, name, className }) => {
  const [failed, setFailed] = useState(false);
  if (!avatarId || failed) {
    return (
      <div className={`${className} trade-avatar-placeholder`}>
        {(name ?? "?")[0].toUpperCase()}
      </div>
    );
  }
  return (
    <img
      className={className}
      src={`https://sleepercdn.com/avatars/thumbs/${avatarId}`}
      alt=""
      onError={() => setFailed(true)}
    />
  );
};

// ─── Team Selector ───────────────────────────────────────────────────────────
const TeamSelector = ({ rosters, onSelect }) => (
  <div className="trade-team-grid">
    {rosters?.map((roster) => (
      <button
        key={roster.roster_id}
        className="trade-team-card"
        onClick={() => onSelect(roster)}
      >
        <Avatar
          className="trade-team-avatar"
          avatarId={roster.avatar}
          name={roster.display_name}
        />
        <p className="light bold sm">{roster.display_name}</p>
        <p className="color-light x-sm">
          {roster.players?.length ?? 0} players
        </p>
      </button>
    ))}
  </div>
);

// ─── Player Search ───────────────────────────────────────────────────────────
const ROUND_LABELS = { 1: "1st", 2: "2nd", 3: "3rd" };

const PlayerSearch = ({ rosters, myRosterId, draftPicks, leagueYear, onSelectPlayer }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Build searchable list of all rostered players + draft picks
  const searchableItems = useMemo(() => {
    if (!rosters) return [];
    const players = rosters
      .flatMap((r) =>
        (r.players ?? []).map((p) => ({
          ...p,
          roster_id: r.roster_id,
          team_name: r.display_name,
          avatar: r.avatar,
          isOwn: r.roster_id === myRosterId,
        })),
      )
      .filter((p) => p.full_name && p.full_name !== "—")
      .sort((a, b) => (b.bfbValue ?? 0) - (a.bfbValue ?? 0));

    // Append draft picks as searchable items
    const rosterMap = Object.fromEntries((rosters ?? []).map((r) => [r.roster_id, r]));
    const picks = (draftPicks ?? [])
      .filter((pk) => pk.season >= (leagueYear ?? new Date().getFullYear()))
      .map((pk) => {
        const owner = rosterMap[pk.current_roster_id];
        const origOwner = rosterMap[pk.original_roster_id];
        const slot = pk.estimated_slot ?? "?";
        const slotPad = String(slot).padStart(2, "0");
        const label = `${pk.season} Round ${pk.round} Pick ${slot}`;
        const origLabel = pk.original_roster_id !== pk.current_roster_id
          ? ` (${origOwner?.display_name ?? "Unknown"}'s pick)`
          : "";
        return {
          _type: "pick",
          id: `pick-${pk.season}-${pk.round}-${pk.original_roster_id}`,
          full_name: `${label}${origLabel}`,
          searchLabel: `pick ${pk.round}.${slotPad} ${pk.season} round ${pk.round} ${ROUND_LABELS[pk.round] ?? pk.round} pick draft`,
          position: "PICK",
          team: null,
          bfbValue: pk.pick_value ?? 0,
          roster_id: pk.current_roster_id,
          team_name: owner?.display_name ?? "Unknown",
          avatar: owner?.avatar,
          isOwn: pk.current_roster_id === myRosterId,
          pick_season: pk.season,
          pick_round: pk.round,
          pick_original_roster_id: pk.original_roster_id,
          estimated_slot: pk.estimated_slot,
        };
      })
      .sort((a, b) => (b.bfbValue ?? 0) - (a.bfbValue ?? 0));

    return [...players, ...picks];
  }, [rosters, myRosterId, draftPicks, leagueYear]);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const queryTokens = q.split(/\s+/).filter(Boolean);

    return searchableItems
      .filter((p) => {
        // Picks: searchLabel contains round/season keywords, use substring match
        if (p._type === "pick") {
          return p.searchLabel?.toLowerCase().includes(q) || false;
        }
        // Players: every query token must match the START of some name word.
        // Prevents "jo" in "johnson" from matching "josh allen" after a few chars.
        const nameTokens = (p.full_name?.toLowerCase() ?? "").split(/\s+/);
        const nameMatch =
          queryTokens.length > 0 &&
          queryTokens.every((qt) => nameTokens.some((nt) => nt.startsWith(qt)));
        return (
          nameMatch ||
          p.position?.toLowerCase() === q ||
          p.team?.toLowerCase() === q
        );
      })
      .slice(0, 8);
  }, [query, searchableItems]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="trade-search-wrap" ref={containerRef}>
      <div className="trade-search-bar">
        <Icon path={mdiMagnify} size={0.8} color="#959595" />
        <input
          ref={inputRef}
          className="trade-search-input"
          placeholder="Search players or picks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          autoComplete="off"
        />
        {query && (
          <button
            className="trade-search-clear"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
            }}
          >
            <Icon path={mdiClose} size={0.6} color="#959595" />
          </button>
        )}
      </div>

      {focused && results.length > 0 && (
        <div className="trade-search-results">
          {results.map((p) => (
            <button
              key={p.id}
              className="trade-search-result-row"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectPlayer(p);
                setQuery("");
              }}
            >
              {p._type === "pick" ? (
                <div className="trade-search-pick-badge">
                  Rd {p.pick_round}
                </div>
              ) : (
                <img
                  className="trade-search-headshot"
                  src={`https://sleepercdn.com/content/nfl/players/${p.id}.jpg`}
                  alt=""
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div className="trade-search-result-info">
                <p className="sm light bold">{p.full_name}</p>
                <p className="x-sm color-light">
                  {p._type === "pick" ? "Draft Pick" : `${p.position} · ${p.team}`}
                </p>
              </div>
              <div className="trade-search-result-meta">
                <p className="x-sm color-light">
                  {p.bfbValue?.toLocaleString() ?? "—"}
                </p>
                <p className="x-sm" style={{ color: p.isOwn ? "#54d846" : "#35a7ff" }}>
                  {p.isOwn ? "Your team" : p.team_name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {focused && query.length >= 2 && results.length === 0 && (
        <div className="trade-search-results">
          <p className="sm color-light p-2">No players or picks found</p>
        </div>
      )}
    </div>
  );
};

// ─── Player Row ───────────────────────────────────────────────────────────────
const PlayerRow = ({ player, selected, onToggle }) => (
  <div
    className={`trade-player-row ${selected ? "trade-player-row--selected" : ""}`}
    onClick={() => onToggle(player.id)}
  >
    <div className="trade-player-info">
      <p className={`sm bold ${selected ? "lime" : "light"}`}>
        {player.full_name}
      </p>
      <p className="x-sm color-light">
        {player.position} · {player.team}
      </p>
    </div>
    <div className="trade-player-meta">
      <p className={`sm ${selected ? "lime" : "color-light"}`}>
        {player.bfbValue?.toLocaleString() ?? "—"}
      </p>
      <div className={`trade-toggle ${selected ? "trade-toggle--on" : ""}`}>
        {selected ? (
          <Icon path={mdiCheck} size={0.6} color="#54d846" />
        ) : (
          <Icon path={mdiArrowRight} size={0.6} color="#959595" />
        )}
      </div>
    </div>
  </div>
);

// ─── Pick Row ─────────────────────────────────────────────────────────────────
const PickRow = ({ pick, selected, onToggle }) => {
  const key = `${pick.round}-${pick.season}-${pick.original_roster_id}`;
  return (
    <div
      className={`trade-player-row ${selected ? "trade-player-row--selected" : ""}`}
      onClick={() => onToggle(key, pick)}
    >
      <div className="trade-player-info">
        <p className={`sm bold ${selected ? "lime" : "light"}`}>
          {pick.season} Round {pick.round}
        </p>
        <p className="x-sm color-light">
          Est. pick #{pick.estimated_slot} · {pick.slot_source}
        </p>
      </div>
      <div className="trade-player-meta">
        <p className={`sm ${selected ? "lime" : "color-light"}`}>
          {pick.pick_value?.toLocaleString() ?? "—"}
        </p>
        <div className={`trade-toggle ${selected ? "trade-toggle--on" : ""}`}>
          {selected ? (
            <Icon path={mdiCheck} size={0.6} color="#54d846" />
          ) : (
            <Icon path={mdiArrowRight} size={0.6} color="#959595" />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Side Panel ───────────────────────────────────────────────────────────────
const SidePanel = ({
  label,
  roster,
  picks,
  playerValueMap,
  selectedPlayerIds,
  selectedPickKeys,
  onTogglePlayer,
  onTogglePick,
}) => {
  const [tab, setTab] = useState("players");

  const rosterPlayers = useMemo(() => {
    if (!roster?.players) return [];
    const enriched = [...roster.players].map((p) => ({
      ...p,
      bfbValue: playerValueMap?.[p.id] ?? p.bfbValue,
    }));
    return enriched.sort((a, b) => (b.bfbValue ?? 0) - (a.bfbValue ?? 0));
  }, [roster, playerValueMap]);

  const rosterPicks = useMemo(() => {
    if (!roster || !picks) return [];
    return filter(picks, { current_roster_id: roster.roster_id });
  }, [roster, picks]);

  return (
    <div className="trade-side-panel">
      <div className="trade-side-header">
        <p className="sm bold color-light">{label}</p>
        {roster && (
          <div className="flex align-center" style={{ gap: 6 }}>
            <Avatar
              className="trade-avatar-sm"
              avatarId={roster.avatar}
              name={roster.display_name}
            />
            <p className="sm light bold">{roster.display_name}</p>
          </div>
        )}
      </div>

      {roster ? (
        <>
          <div className="trade-tabs">
            <button
              className={`trade-tab ${tab === "players" ? "trade-tab--active" : ""}`}
              onClick={() => setTab("players")}
            >
              Players ({rosterPlayers.length})
            </button>
            <button
              className={`trade-tab ${tab === "picks" ? "trade-tab--active" : ""}`}
              onClick={() => setTab("picks")}
            >
              Picks ({rosterPicks.length})
            </button>
          </div>

          <div className="trade-list">
            {tab === "players" &&
              rosterPlayers.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  selected={selectedPlayerIds.includes(p.id)}
                  onToggle={onTogglePlayer}
                />
              ))}
            {tab === "picks" &&
              rosterPicks.map((pick) => {
                const key = `${pick.round}-${pick.season}-${pick.original_roster_id}`;
                return (
                  <PickRow
                    key={key}
                    pick={pick}
                    selected={selectedPickKeys.includes(key)}
                    onToggle={onTogglePick}
                  />
                );
              })}
            {tab === "players" && rosterPlayers.length === 0 && (
              <p className="sm color-light p-2">No player data</p>
            )}
            {tab === "picks" && rosterPicks.length === 0 && (
              <p className="sm color-light p-2">No picks</p>
            )}
          </div>

          <div className="trade-selected-summary">
            <p className="x-sm color-light">
              {selectedPlayerIds.length} player
              {selectedPlayerIds.length !== 1 ? "s" : ""}
              {selectedPickKeys.length > 0 &&
                `, ${selectedPickKeys.length} pick${selectedPickKeys.length !== 1 ? "s" : ""}`}{" "}
              selected
            </p>
          </div>
        </>
      ) : (
        <div className="trade-empty-panel">
          <p className="sm color-light">Select a team above</p>
        </div>
      )}
    </div>
  );
};

// ─── Fairness Result ──────────────────────────────────────────────────────────
const FairnessResult = ({ result, sideAName, sideBName, onReset }) => {
  const { fairness, winner, margin, breakdown, advanced } = result;
  const barPercent = fairness;
  const winnerName =
    winner === "side_a" ? sideAName : winner === "side_b" ? sideBName : null;

  return (
    <div className="trade-result">
      <div className="flex justify-between align-center pb-2">
        <h3>Trade Analysis</h3>
        <button className="trade-reset-btn" onClick={onReset}>
          <Icon path={mdiRefresh} size={0.8} color="#A7A7A7" />
          <p className="sm color-light">New Trade</p>
        </button>
      </div>

      {/* Fairness bar */}
      <div className="trade-fairness-bar-wrap">
        <p className="x-sm color-light mb-1">Fairness</p>
        <div className="trade-fairness-track">
          <div className="trade-fairness-center" />
          <div
            className="trade-fairness-marker"
            style={{ left: `${barPercent}%` }}
          />
        </div>
        <div className="flex justify-between pt-1">
          <p className="x-sm" style={{ color: "#35a7ff" }}>{sideAName} wins</p>
          <p className="x-sm" style={{ color: "#ff3f5d" }}>{sideBName} wins</p>
        </div>
      </div>

      {/* Verdict */}
      <div className="trade-result-verdict">
        {winner === "even" ? (
          <p className="light bold sm">Even trade</p>
        ) : (
          <p className="light bold sm">
            <span className="lime">{winnerName}</span> wins —{" "}
            {MARGIN_LABELS[margin] ?? margin}
          </p>
        )}
      </div>

      {/* Per-player breakdown */}
      {result.players?.length > 0 && (
        <div className="trade-result-players">
          <p className="sm color-light pb-2">Players in trade</p>
          {result.players.map((p) => (
            <div key={p.id} className="trade-result-player-row">
              <div>
                <p className="sm light bold">{p.full_name}</p>
                <p className="x-sm color-light">{p.position}</p>
              </div>
              <div className="trade-player-values">
                <p className="sm lime">
                  {p.bfbValue?.toLocaleString() ?? "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Value breakdown */}
      <div className="trade-result-breakdown">
        <div className="trade-result-side">
          <p className="sm color-light pb-1">{sideAName}</p>
          <p className="light bold">
            {breakdown.side_a_value.toLocaleString()}
          </p>
          {breakdown.side_a_picks_value > 0 && (
            <p className="x-sm color-light">
              +{breakdown.side_a_picks_value.toLocaleString()} in picks
            </p>
          )}
        </div>
        <div className="trade-result-divider">
          <p className="sm color-light">vs</p>
        </div>
        <div className="trade-result-side">
          <p className="sm color-light pb-1">{sideBName}</p>
          <p className="light bold">
            {breakdown.side_b_value.toLocaleString()}
          </p>
          {breakdown.side_b_picks_value > 0 && (
            <p className="x-sm color-light">
              +{breakdown.side_b_picks_value.toLocaleString()} in picks
            </p>
          )}
        </div>
      </div>
      {/* Advanced analysis from Python (keeper impact) */}
      {advanced && (
        <div className="trade-advanced">
          <div className="trade-advanced-header">
            <p className="sm bold color-light">Keeper Impact</p>
          </div>

          <div className="trade-advanced-verdicts">
            {advanced.win_now_verdict && (
              <div className="trade-verdict-row">
                <p className="x-sm color-light">Win now</p>
                <p className="x-sm light">{advanced.win_now_verdict}</p>
              </div>
            )}
            {advanced.dynasty_verdict && (
              <div className="trade-verdict-row">
                <p className="x-sm color-light">Long-term</p>
                <p className="x-sm light">{advanced.dynasty_verdict}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Player Action Card ──────────────────────────────────────────────────────
const DEAL_PREFS = [
  { key: "any", label: "Any" },
  { key: "players_only", label: "Players Only" },
  { key: "player_plus_picks", label: "Player + Picks" },
];

const PlayerActionCard = ({ player, isOwn, dealPref, onDealPrefChange, onCreateTrade, onFindDeals, finding }) => (
  <div className="trade-action-card">
    <div className="trade-action-player">
      {player._type === "pick" ? (
        <div className="trade-action-pick-badge">Rd {player.pick_round}</div>
      ) : (
        <img
          className="trade-action-headshot"
          src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`}
          alt=""
          onError={(e) => (e.target.style.display = "none")}
        />
      )}
      <div className="trade-action-player-info">
        <p className="light bold">{player.full_name}</p>
        <p className="sm color-light">
          {player._type === "pick" ? "Draft Pick" : `${player.position} · ${player.team}`}
        </p>
        <p className="sm" style={{ color: isOwn ? "#54d846" : "#35a7ff" }}>
          {player.bfbValue?.toLocaleString() ?? "—"} value
          {isOwn ? (player._type === "pick" ? " · Your pick" : " · Your player") : ` · ${player.team_name}`}
        </p>
      </div>
    </div>

    <div className="trade-pref-row">
      <p className="x-sm color-light">Deal type</p>
      <div className="trade-pref-pills">
        {DEAL_PREFS.map((p) => (
          <button
            key={p.key}
            className={`trade-pref-pill ${dealPref === p.key ? "trade-pref-pill--active" : ""}`}
            onClick={() => onDealPrefChange(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>

    <div className="trade-action-buttons">
      <button className="trade-action-btn trade-action-btn--create" onClick={onCreateTrade}>
        <Icon path={mdiSwapHorizontal} size={0.8} color="#1f2126" />
        <span>Create Trade</span>
      </button>
      <button
        className="trade-action-btn trade-action-btn--find"
        onClick={onFindDeals}
        disabled={finding}
      >
        <Icon path={mdiAutoFix} size={0.8} color="#1f2126" />
        <span>{finding ? "Finding..." : "Find Deals"}</span>
      </button>
    </div>
  </div>
);

// ─── Deal Card ───────────────────────────────────────────────────────────────
const DealCard = ({ deal, onOpenInCalculator }) => {
  const typeLabels = {
    player_for_player: "1-for-1",
    player_plus_picks: "Player + Picks",
    multi_player: "Package Deal",
    pick_for_player: "Pick for Player",
    player_for_pick: "Player for Pick",
    picks_only: "Picks Only",
  };

  const fairness = deal.fairness;

  return (
    <div className="trade-deal-card">
      <div className="trade-deal-header">
        <div className="trade-deal-team">
          <p className="sm light bold">{deal.target_team.display_name}</p>
          <span className={`trade-deal-type trade-deal-type--${deal.type}`}>
            {typeLabels[deal.type] ?? deal.type}
          </span>
        </div>
      </div>

      <div className="trade-deal-sides">
        <div className="trade-deal-side">
          <p className="x-sm color-light pb-1">You give</p>
          {deal.give.players.map((p) => (
            <div key={p.id} className="trade-deal-player">
              <p className="sm light">{p.full_name}</p>
              <p className="x-sm color-light">{p.position} · {p.bfbValue?.toLocaleString()}</p>
            </div>
          ))}
          {deal.give.picks.map((p, i) => (
            <div key={i} className="trade-deal-player">
              <p className="sm light">{p.season} Rd {p.round}{p.estimated_slot ? ` (Pick ${p.estimated_slot})` : ""}</p>
              <p className="x-sm color-light">{p.pick_value?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="trade-deal-arrow">
          <Icon path={mdiSwapHorizontal} size={0.7} color="#959595" />
        </div>
        <div className="trade-deal-side">
          <p className="x-sm color-light pb-1">You get</p>
          {deal.receive.players.map((p) => (
            <div key={p.id} className="trade-deal-player">
              <p className="sm light">{p.full_name}</p>
              <p className="x-sm color-light">{p.position} · {p.bfbValue?.toLocaleString()}</p>
            </div>
          ))}
          {deal.receive.picks.map((p, i) => (
            <div key={i} className="trade-deal-player">
              <p className="sm light">{p.season} Rd {p.round}{p.estimated_slot ? ` (Pick ${p.estimated_slot})` : ""}</p>
              <p className="x-sm color-light">{p.pick_value?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="trade-deal-footer">
        <div className="trade-deal-fairness">
          <div className="trade-deal-fairness-track">
            <div className="trade-deal-fairness-center" />
            <div
              className="trade-deal-fairness-marker"
              style={{ left: `${fairness}%` }}
            />
          </div>
          <div className="flex justify-between">
            <p className="x-sm" style={{ color: "#35a7ff" }}>You win</p>
            <p className="x-sm" style={{ color: "#ff3f5d" }}>
              {deal.target_team.display_name} wins
            </p>
          </div>
        </div>
        <p className="x-sm color-light trade-deal-rationale">{deal.rationale}</p>
        <button className="trade-deal-open-btn" onClick={() => onOpenInCalculator(deal)}>
          Open in Calculator
        </button>
      </div>
    </div>
  );
};

// ─── Deals Result ────────────────────────────────────────────────────────────
const DealsResult = ({ result, onOpenInCalculator, onBack }) => (
  <div className="trade-deals-result">
    <div className="flex justify-between align-center pb-2">
      <div>
        <p className="sm color-light">
          {result.deals.length} deal{result.deals.length !== 1 ? "s" : ""} found
          {result.team_needs?.length > 0 && (
            <span> · Your needs: {result.team_needs.join(", ")}</span>
          )}
        </p>
      </div>
      <button className="trade-reset-btn" onClick={onBack}>
        <Icon path={mdiRefresh} size={0.8} color="#A7A7A7" />
        <p className="sm color-light">Back</p>
      </button>
    </div>

    {result.deals.length === 0 ? (
      <div className="trade-deals-empty">
        <p className="sm color-light">
          {result.message || "No trade matches found for this player. They may already be in every team's top 8, or no teams have matching surplus players."}
        </p>
      </div>
    ) : (
      <div className="trade-deals-list">
        {result.deals.map((deal, i) => (
          <DealCard key={i} deal={deal} onOpenInCalculator={onOpenInCalculator} />
        ))}
      </div>
    )}
  </div>
);

// ─── Recommended Trades Result ────────────────────────────────────────────────
const CATEGORY_TABS = [
  { key: "upgrade", label: "Upgrades" },
  { key: "fill_need", label: "Fill Needs" },
  { key: "sell_surplus", label: "Sell Surplus" },
];

const RecommendedTradesResult = ({ result, onOpenInCalculator, onBack }) => {
  const [activeTab, setActiveTab] = useState("upgrade");
  const { team_analysis, categories } = result;
  const totalDeals = Object.values(categories).reduce((s, arr) => s + arr.length, 0);

  const activDeals = categories[activeTab] ?? [];

  return (
    <div className="trade-deals-result">
      <div className="trade-team-summary">
        <div className="trade-team-summary-item">
          <p className="sm bold light">{team_analysis.keeper_count}</p>
          <p className="x-sm color-light">Keepers</p>
        </div>
        <div className="trade-team-summary-item">
          <p className="sm bold light">{team_analysis.top_8_value?.toLocaleString()}</p>
          <p className="x-sm color-light">Top 8 Value</p>
        </div>
        {team_analysis.needs.length > 0 && (
          <div className="trade-team-summary-item">
            <p className="sm bold light">{team_analysis.needs.join(", ")}</p>
            <p className="x-sm color-light">Needs</p>
          </div>
        )}
        {team_analysis.surplus.length > 0 && (
          <div className="trade-team-summary-item">
            <p className="sm bold light">{team_analysis.surplus.length}</p>
            <p className="x-sm color-light">Surplus</p>
          </div>
        )}
      </div>

      <div className="flex justify-between align-center pb-2 pt-2">
        <p className="sm color-light">{totalDeals} recommendation{totalDeals !== 1 ? "s" : ""} found</p>
        <button className="trade-reset-btn" onClick={onBack}>
          <Icon path={mdiRefresh} size={0.8} color="#A7A7A7" />
          <p className="sm color-light">Back</p>
        </button>
      </div>

      <div className="trade-category-tabs">
        {CATEGORY_TABS.map((tab) => {
          const count = (categories[tab.key] ?? []).length;
          return (
            <button
              key={tab.key}
              className={`trade-category-tab ${activeTab === tab.key ? "trade-category-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {count > 0 && <span className="trade-category-badge">{count}</span>}
            </button>
          );
        })}
      </div>

      {activDeals.length === 0 ? (
        <div className="trade-deals-empty">
          <p className="sm color-light">
            {activeTab === "upgrade" && "No upgrade opportunities found. Your starters are already strong at each position."}
            {activeTab === "fill_need" && "No positional needs identified — your keeper roster is well-rounded."}
            {activeTab === "sell_surplus" && "No surplus sell opportunities found. You don't have extra keeper-worthy players to move."}
          </p>
        </div>
      ) : (
        <div className="trade-deals-list">
          {activDeals.map((deal, i) => (
            <DealCard key={i} deal={deal} onOpenInCalculator={onOpenInCalculator} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TradePage = () => {
  const leagueId = useSelector(selectLeagueId);
  const leagueYear = useSelector(selectLeagueYear);

  const { data: rawRosters, isLoading: rostersLoading } =
    useGetLeagueRostersQuery();
  const { data: draftPicks } = useGetLeagueDraftPicksQuery();
  const { data: playersAll } = useGetPlayersAllQuery({
    year: leagueYear,
    mock: true,
  });
  const { data: users } = useGetUsersQuery();

  const [calculateTrade, { isLoading: calculating }] =
    useCalculateTradeMutation();
  const [findDeals, { isLoading: findingDeals }] =
    useFindDealsMutation();
  const [getRecommendedTrades, { isLoading: loadingRecommended }] =
    useGetRecommendedTradesMutation();

  const [step, setStep] = useState("select"); // select | search | action | build | result | deals | recommended
  const [myRoster, setMyRoster] = useState(null);
  const [theirRoster, setTheirRoster] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [dealsResult, setDealsResult] = useState(null);
  const [recommendedResult, setRecommendedResult] = useState(null);
  const [dealPref, setDealPref] = useState("any");
  const [sideAPlayerIds, setSideAPlayerIds] = useState([]);
  const [sideBPlayerIds, setSideBPlayerIds] = useState([]);
  const [sideAPickKeys, setSideAPickKeys] = useState([]);
  const [sideBPickKeys, setSideBPickKeys] = useState([]);
  const [sideAPickMap, setSideAPickMap] = useState({});
  const [sideBPickMap, setSideBPickMap] = useState({});
  const [tradeResult, setTradeResult] = useState(null);
  const [error, setError] = useState(null);

  const playersAllArr = useMemo(() => {
    if (!playersAll) return [];
    return Array.isArray(playersAll) ? playersAll : Object.values(playersAll);
  }, [playersAll]);

  const playerValueMap = useMemo(() => {
    return Object.fromEntries(playersAllArr.map((p) => [p.id, p.bfbValue]));
  }, [playersAllArr]);

  const playersById = useMemo(() => {
    return Object.fromEntries(playersAllArr.map((p) => [p.id, p]));
  }, [playersAllArr]);

  const rosters = useMemo(() => {
    if (!rawRosters || !users) return [];
    return rawRosters.map((roster) => {
      const owner = users.find((u) => u.user_id === roster.owner_id);
      const players = (roster.players ?? []).map((p) => {
        const id = typeof p === "object" && p !== null ? p.id : p;
        const enriched = playersById[id];
        if (enriched) {
          return {
            ...enriched,
            bfbValue: enriched.bfbValue,
          };
        }
        if (typeof p === "object" && p !== null) {
          return { ...p, bfbValue: playerValueMap[p.id] ?? p.bfbValue ?? p.value };
        }
        return {
          id: p,
          full_name: p,
          position: "—",
          team: "—",
          bfbValue: playerValueMap[p] ?? undefined,
        };
      });
      return {
        ...roster,
        display_name: owner?.display_name ?? `Team ${roster.roster_id}`,
        avatar: owner?.avatar,
        players,
      };
    });
  }, [rawRosters, users, playersById, playerValueMap]);

  const togglePlayer = (ids, setIds) => (id) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const togglePick = (keys, setKeys, pickMap, setPickMap) => (key, pick) => {
    setKeys((prev) => {
      if (prev.includes(key)) {
        const next = { ...pickMap };
        delete next[key];
        setPickMap(next);
        return prev.filter((x) => x !== key);
      }
      setPickMap((m) => ({ ...m, [key]: pick }));
      return [...prev, key];
    });
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    setStep("action");
  };

  const handleCreateTrade = () => {
    const isOwn = selectedPlayer.roster_id === myRoster?.roster_id;

    if (selectedPlayer._type === "pick") {
      // Pre-select the pick on the appropriate side
      const pickKey = `${selectedPlayer.pick_round}-${selectedPlayer.pick_season}-${selectedPlayer.pick_original_roster_id}`;
      const pickData = {
        round: selectedPlayer.pick_round,
        season: selectedPlayer.pick_season,
        original_roster_id: selectedPlayer.pick_original_roster_id,
        current_roster_id: selectedPlayer.roster_id,
        estimated_slot: selectedPlayer.estimated_slot,
        pick_value: selectedPlayer.bfbValue,
      };
      if (isOwn) {
        setSideAPickKeys([pickKey]);
        setSideAPickMap({ [pickKey]: pickData });
        setStep("build");
      } else {
        const theirTeam = rosters.find((r) => r.roster_id === selectedPlayer.roster_id);
        if (theirTeam) {
          setTheirRoster(theirTeam);
          setSideBPickKeys([pickKey]);
          setSideBPickMap({ [pickKey]: pickData });
          setStep("build");
        }
      }
    } else if (isOwn) {
      // Trading our player away — pre-select on our side, let user pick opponent
      setSideAPlayerIds([selectedPlayer.id]);
      setStep("build");
    } else {
      // Trading for their player — pre-select on their side
      const theirTeam = rosters.find(
        (r) => r.roster_id === selectedPlayer.roster_id,
      );
      if (theirTeam) {
        setTheirRoster(theirTeam);
        setSideBPlayerIds([selectedPlayer.id]);
        setStep("build");
      }
    }
  };

  const handleFindDeals = async () => {
    try {
      const body = {
        year: leagueYear,
        roster_id: myRoster.roster_id,
        league_id: leagueId,
        deal_pref: dealPref,
      };
      if (selectedPlayer._type === "pick") {
        body.pick_id = {
          season: selectedPlayer.pick_season,
          round: selectedPlayer.pick_round,
          original_roster_id: selectedPlayer.pick_original_roster_id,
        };
      } else {
        body.player_id = selectedPlayer.id;
      }
      const result = await findDeals(body).unwrap();
      setDealsResult(result);
      setStep("deals");
    } catch (e) {
      console.error("Find deals failed:", e);
      setError("Failed to find deals. Please try again.");
    }
  };

  const handleGetRecommended = async () => {
    try {
      setError(null);
      const result = await getRecommendedTrades({
        year: leagueYear,
        roster_id: myRoster.roster_id,
        league_id: leagueId,
      }).unwrap();
      setRecommendedResult(result);
      setStep("recommended");
    } catch (e) {
      console.error("Recommended trades failed:", e);
      setError("Failed to get recommendations. Please try again.");
    }
  };

  const handleOpenDealInCalculator = (deal) => {
    // Find the target team roster
    const theirTeam = rosters.find(
      (r) => r.roster_id === deal.target_team.roster_id,
    );
    if (theirTeam) {
      setTheirRoster(theirTeam);
      setSideAPlayerIds(deal.give.players.map((p) => p.id));
      setSideBPlayerIds(deal.receive.players.map((p) => p.id));

      // Pre-fill picks from the deal
      const toPickEntries = (picks) =>
        (picks ?? []).reduce((acc, p) => {
          const key = `${p.round}-${p.season}-${p.original_roster_id}`;
          acc.keys.push(key);
          acc.map[key] = p;
          return acc;
        }, { keys: [], map: {} });

      const givePicks = toPickEntries(deal.give.picks);
      const recvPicks = toPickEntries(deal.receive.picks);
      setSideAPickKeys(givePicks.keys);
      setSideAPickMap(givePicks.map);
      setSideBPickKeys(recvPicks.keys);
      setSideBPickMap(recvPicks.map);

      setStep("build");
    }
  };

  const handleCalculate = async () => {
    setError(null);
    const toPickPayload = (pickMap) =>
      Object.values(pickMap).map((p) => ({
        round: p.round,
        season: p.season,
        roster_id: p.original_roster_id,
      }));

    try {
      const result = await calculateTrade({
        year: leagueYear,
        league_id: leagueId,
        side_a: {
          players: sideAPlayerIds,
          picks: toPickPayload(sideAPickMap),
          roster_id: myRoster?.roster_id,
          name: myRoster?.display_name,
        },
        side_b: {
          players: sideBPlayerIds,
          picks: toPickPayload(sideBPickMap),
          roster_id: theirRoster?.roster_id,
          name: theirRoster?.display_name,
        },
      }).unwrap();
      setTradeResult({
        ...result,
        _sideAIds: sideAPlayerIds,
        _sideBIds: sideBPlayerIds,
      });
      setStep("result");
    } catch (e) {
      console.error("Trade calculation failed:", e);
      setError("Failed to calculate trade. Please try again.");
    }
  };

  const handleReset = () => {
    setStep("search");
    setTradeResult(null);
    setSideAPlayerIds([]);
    setSideBPlayerIds([]);
    setSideAPickKeys([]);
    setSideBPickKeys([]);
    setSideAPickMap({});
    setSideBPickMap({});
    setTheirRoster(null);
    setSelectedPlayer(null);
    setDealsResult(null);
    setRecommendedResult(null);
    setDealPref("any");
    setError(null);
  };

  const handleFullReset = () => {
    handleReset();
    setMyRoster(null);
    setStep("select");
  };

  const canCalculate =
    (sideAPlayerIds.length > 0 || sideAPickKeys.length > 0) &&
    (sideBPlayerIds.length > 0 || sideBPickKeys.length > 0);

  return (
    <Content dark isLoading={rostersLoading}>
      <div className="trade-page">
        {/* ── STEP: SELECT TEAM ── */}
        {step === "select" && (
          <div>
            <div className="trade-page-header">
              <h2>Trade Center</h2>
              <p className="sm color-light pt-1">
                Select your team to get started
              </p>
            </div>
            <TeamSelector
              rosters={rosters}
              onSelect={(roster) => {
                setMyRoster(roster);
                setStep("search");
              }}
            />
          </div>
        )}

        {/* ── STEP: SEARCH FOR PLAYER ── */}
        {step === "search" && (
          <div>
            <div className="trade-page-header flex justify-between align-center">
              <div>
                <h2>Trade Center</h2>
                <p className="sm color-light pt-1">
                  Search for a player to trade
                </p>
              </div>
              <button className="trade-reset-btn" onClick={handleFullReset}>
                <Icon path={mdiClose} size={0.7} color="#A7A7A7" />
                <p className="x-sm color-light">Change team</p>
              </button>
            </div>

            <div className="flex align-center mb-2" style={{ gap: 8 }}>
              <Avatar
                className="trade-avatar-sm"
                avatarId={myRoster?.avatar}
                name={myRoster?.display_name}
              />
              <p className="sm light bold">{myRoster?.display_name}</p>
            </div>

            <button
              className="trade-recommended-btn"
              onClick={handleGetRecommended}
              disabled={loadingRecommended}
            >
              <Icon path={mdiAutoFix} size={0.8} color={loadingRecommended ? "#959595" : "#54d846"} />
              <div>
                <p className="sm bold light">
                  {loadingRecommended ? "Analyzing your roster..." : "Recommended Trades"}
                </p>
                <p className="x-sm color-light">Find upgrades, fill needs, or sell surplus</p>
              </div>
            </button>

            {error && step === "search" && (
              <p className="sm" style={{ color: "#ff3f5d", padding: "8px 0" }}>{error}</p>
            )}

            <div className="trade-recommended-divider">
              <span className="x-sm color-light">or search for a player or pick</span>
            </div>

            <PlayerSearch
              rosters={rosters}
              myRosterId={myRoster?.roster_id}
              draftPicks={draftPicks}
              leagueYear={leagueYear}
              onSelectPlayer={handleSelectPlayer}
            />
          </div>
        )}

        {/* ── STEP: ACTION (Create Trade / Find Deals) ── */}
        {step === "action" && selectedPlayer && (
          <div>
            <div className="trade-page-header flex justify-between align-center">
              <div>
                <h2>Trade Center</h2>
                <p className="sm color-light pt-1">
                  What would you like to do?
                </p>
              </div>
              <button className="trade-reset-btn" onClick={handleReset}>
                <Icon path={mdiClose} size={0.7} color="#A7A7A7" />
                <p className="x-sm color-light">Back</p>
              </button>
            </div>

            <PlayerActionCard
              player={selectedPlayer}
              isOwn={selectedPlayer.roster_id === myRoster?.roster_id}
              dealPref={dealPref}
              onDealPrefChange={setDealPref}
              onCreateTrade={handleCreateTrade}
              onFindDeals={handleFindDeals}
              finding={findingDeals}
            />

            {error && (
              <p className="sm" style={{ color: "#ff3f5d", padding: "8px 0" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── STEP: DEALS RESULT ── */}
        {step === "deals" && dealsResult && (
          <div>
            <div className="trade-page-header flex justify-between align-center">
              <div>
                <h2>Trade Center</h2>
                <p className="sm color-light pt-1">
                  {dealsResult.is_selling ? "Trade away" : "Acquire"} {selectedPlayer?.full_name}
                </p>
              </div>
              <button className="trade-reset-btn" onClick={handleFullReset}>
                <Icon path={mdiClose} size={0.7} color="#A7A7A7" />
                <p className="x-sm color-light">Start over</p>
              </button>
            </div>

            <DealsResult
              result={dealsResult}
              onOpenInCalculator={handleOpenDealInCalculator}
              onBack={() => setStep("action")}
            />
          </div>
        )}

        {/* ── STEP: RECOMMENDED TRADES ── */}
        {step === "recommended" && recommendedResult && (
          <div>
            <div className="trade-page-header flex justify-between align-center">
              <div>
                <h2>Trade Center</h2>
                <p className="sm color-light pt-1">
                  Recommended trades for {myRoster?.display_name}
                </p>
              </div>
              <button className="trade-reset-btn" onClick={handleFullReset}>
                <Icon path={mdiClose} size={0.7} color="#A7A7A7" />
                <p className="x-sm color-light">Start over</p>
              </button>
            </div>

            <RecommendedTradesResult
              result={recommendedResult}
              onOpenInCalculator={handleOpenDealInCalculator}
              onBack={() => { setRecommendedResult(null); setStep("search"); }}
            />
          </div>
        )}

        {/* ── STEP: BUILD TRADE ── */}
        {(step === "build" || step === "result") && (
          <div>
            <div className="trade-page-header flex justify-between align-center">
              <div>
                <h2>Trade Center</h2>
                <p className="sm color-light pt-1">
                  Tap players or picks to add them to the trade
                </p>
              </div>
              <button className="trade-reset-btn" onClick={handleFullReset}>
                <Icon path={mdiClose} size={0.7} color="#A7A7A7" />
                <p className="x-sm color-light">Start over</p>
              </button>
            </div>

            {step === "result" && tradeResult && (
              <FairnessResult
                result={tradeResult}
                sideAName={myRoster?.display_name ?? "Your Side"}
                sideBName={theirRoster?.display_name ?? "Their Side"}
                onReset={handleReset}
              />
            )}

            {step === "build" && (
              <>
                <div className="trade-panels">
                  <SidePanel
                    label="Your Side"
                    roster={myRoster}
                    picks={draftPicks}
                    playerValueMap={playerValueMap}
                    selectedPlayerIds={sideAPlayerIds}
                    selectedPickKeys={sideAPickKeys}
                    onTogglePlayer={togglePlayer(
                      sideAPlayerIds,
                      setSideAPlayerIds,
                    )}
                    onTogglePick={togglePick(
                      sideAPickKeys,
                      setSideAPickKeys,
                      sideAPickMap,
                      setSideAPickMap,
                    )}
                  />

                  <SidePanel
                    label="Their Side"
                    roster={theirRoster}
                    picks={draftPicks}
                    playerValueMap={playerValueMap}
                    selectedPlayerIds={sideBPlayerIds}
                    selectedPickKeys={sideBPickKeys}
                    onTogglePlayer={togglePlayer(
                      sideBPlayerIds,
                      setSideBPlayerIds,
                    )}
                    onTogglePick={togglePick(
                      sideBPickKeys,
                      setSideBPickKeys,
                      sideBPickMap,
                      setSideBPickMap,
                    )}
                  />
                </div>

                {error && (
                  <p
                    className="sm"
                    style={{ color: "#ff3f5d", padding: "8px 16px" }}
                  >
                    {error}
                  </p>
                )}

                <div className="trade-calculate-bar">
                  <Button
                    className="w-100 flex justify-center align-center p-2"
                    onClick={handleCalculate}
                    disabled={!canCalculate || calculating}
                    active={canCalculate && !calculating}
                  >
                    <p className="sm dark bold">
                      {calculating ? "Calculating..." : "Check Fairness"}
                    </p>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Content>
  );
};

export default TradePage;
