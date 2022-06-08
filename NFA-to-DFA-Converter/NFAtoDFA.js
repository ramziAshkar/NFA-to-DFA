//D0M JS
class UserInput {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
}
$(document).ready(function() {
  $("#new-transition").click(function() {
    let transitionsDiv = $("#nfa-transitions");
    let clone = $("#nfa-transitions .production-row").last().clone(true);

    clone.appendTo(transitionsDiv);
  });

  $(".production-row input").on("keypress", function(e) {
    if (e.which === 13) {
      $("#new-transition").click();
    }
  });

  $(".production-row input").on("keyup", function(e) {
    if (e.which !== 13) {
      $("#verify-update-debug").click();
    }
  });

  $("#initialStateInput").on("keyup", function(e) {
    $("#verify-update-debug").click();
  });

  $("#finalStatesInput").on("keyup", function(e) {
    $("#verify-update-debug").click();
  });

  $("#exampleBtn").click(function() {
    $("#initialStateInput").val("q0");
    $("#finalStatesInput").val("q1");

    let transitionsDiv = $("#nfa-transitions");
    let clone = $("#nfa-transitions .production-row").first().clone(true);

    transitionsDiv.children().each(function() {
      $(this).remove();
    });

    clone.find(".current-state-input").val("q0");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q0");
    clone.find(".input-symbol").val("");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q0");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q2");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q1");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q2");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q2");
    clone.find(".input-symbol").val("a");
    clone.find(".next-states").val("q2");
    transitionsDiv.append(clone);

    clone = clone.clone(true);
    clone.find(".current-state-input").val("q2");
    clone.find(".input-symbol").val("b");
    clone.find(".next-states").val("q1");
    transitionsDiv.append(clone);

    $("#verify-update-debug").click();
  });

  $("#verify-update-debug").click(function() {
    let user_input = fetchUserInput();

    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=LR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = doublecircle]; " + user_input.finalStates + ";\n";
    dotStr += "node [shape = point]; INITIAL_STATE\n";
    dotStr += "node [shape = circle];\n";
    dotStr += "INITIAL_STATE -> " + user_input.initialState + ";\n";

    for (let transition of user_input.transitions)
      dotStr +=
      "" +
      transition.state +
      " -> " +
      transition.nextStates +
      " [label=" +
      transition.symbol +
      "];\n";

    dotStr += "}";


    console.log(dotStr);
    d3.select("#current-nfa").graphviz().zoom(false).renderDot(dotStr);

    // generate the DFA
    let dfa = generateDFA(
      new NFA(
        user_input.initialState,
        user_input.finalStates,
        user_input.states,
        user_input.alphabet,
        user_input.transitions
      )
    );

    let step_div = $("#step-div");

    step_div.empty();

    for (let i = 0; i <= LAST_COMPLETED_STEP_COUNT; i++) {
      step_div.append(
        '<button class="btn btn-xs btn-outline-info" data-step-number="' +
        (i + 1) +
        '">Step ' +
        (i + 1) +
        "</button>"
      );
    }

    dotStr = dfa.toDotString();
    console.log(dotStr);
    d3.select("#current-dfa").graphviz().zoom(false).renderDot(dotStr);

  });

  function fetchUserInput() {
    let initialState = $("#initialStateInput").val().trim();
    let finalStates = $("#finalStatesInput").val().trim();
    let states = [];
    let alphabet = [];
    let transitions = [];

    if (initialState.includes("{") || finalStates.includes("{")) {
      alert('State names cannot contain the "{" character!');
      return null;
    }

    $(".production-row").each(function() {
      let currentState = $(this).find(".current-state-input").val().trim();
      let inputSymbol = $(this).find(".input-symbol").val().trim();

      if (inputSymbol === "") inputSymbol = "\u03B5"; //Epsilon character

      let nextState = $(this).find(".next-states").val().trim();

      // TODO Better state validation?
      if (currentState.includes("{") || nextState.includes("{")) {
        alert('State names cannot contain the "{" character!');
        return;
      }

      transitions.push(new Transition(currentState, nextState, inputSymbol));

      // Populate alphabet without Epsilon
      if (inputSymbol !== "\u03B5" && !alphabet.includes(inputSymbol))
        alphabet.push(inputSymbol);

      if (!states.includes(currentState)) states.push(currentState);

      if (!states.includes(nextState)) states.push(nextState);
    });

    if (finalStates.includes(",")) finalStates = finalStates.split(",");

    return new UserInput(
      initialState,
      finalStates,
      states,
      alphabet,
      transitions
    );
  }
});

//let LAST_COMPLETED_STEP_COUNT = 0;

class Transition {
  constructor(state, nextStates, symbol) {
    if (!Array.isArray(nextStates)) {
      let arr = [];
      arr.push(nextStates.toString());
      nextStates = arr;
    }
    this.state = state;
    this.nextStates = nextStates;
    this.symbol = symbol;
  }
}

class NFA {
  constructor(initialState, finalStates, states, alphabet, transitions) {

    if (!Array.isArray(finalStates)) {
      let arr = [];
      arr.push(finalStates.toString());
      finalStates = arr;
    }

    if (!Array.isArray(alphabet)) {
      let arr = [];
      arr.push(alphabet.toString());
      alphabet = arr;
    }

    if (!Array.isArray(transitions)) {
      let arr = [];
      arr.push(transitions);
      transitions = arr;
    }

    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }

  toDotString() {
    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=LR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = point]; INITIAL_STATE\n";
    dotStr +=
      "node [shape = doublecircle]; " + this.finalStates.join(",") + ";\n";
    dotStr += "node [shape = circle];\n";
    dotStr +=
      "INITIAL_STATE -> " + this.formatDotState(this.initialState) + ";\n";

    for (let i = 0; i < this.transitions.length; i++) {
      let t = this.transitions[i];

      dotStr += "" + this.formatDotState(t.state) +" -> " + this.formatDotState(t.nextStates) +" [label=" + t.symbol +"];\n";
    }

    dotStr += "}";

    return dotStr;
  }

  formatDotState(state_str) {
    state_str = state_str.toString();
    if (isMultiState(state_str)) {
      state_str = state_str.substring(1, state_str.length - 1);
      state_str = state_str.replace(/,/g, "");
      return state_str;
    } else {
      return state_str;
    }
  }
}

function epsilonClosureNFA(nfa) {
  let containsepsilon = false;
  for (let t of nfa.transitions) {
    if (t.symbol === "" || t.symbol === "\u03B5") {
      containsepsilon = true;
      break;
    }
  }

  // If we don't have Epsilon transitions, don't do anything to it
  if (!containsepsilon) return nfa;

  let nfa_closed_transitions = [];
  let nfa_closed_final_states = [];

  for (let i = 0; i < nfa.states.length; i++) {
    let state = nfa.states[i];

    // 1) Find the Epsilon-closure of the state
    let state_closure = obtain_E_Closure(state, nfa.transitions);
    // 2) Find the next state for each state in the state_closure for each symbol in the alphabet
    for (let j = 0; j < nfa.alphabet.length; j++) {
      let symbol = nfa.alphabet[j];
      let symbol_next_states = [];

      for (let k = 0; k < state_closure.length; k++) {
        let next_states = findNextStates(state_closure[k], symbol, nfa.transitions);

        if (next_states.length !== 0) {
          for (let n = 0; n < next_states.length; n++) {
            let closure = obtain_E_Closure(next_states[n], nfa.transitions);
            for (let m = 0; m < closure.length; m++) {
              let to_add = closure[m];
              if (!symbol_next_states.includes(to_add))
                symbol_next_states.push(to_add);
            }
          }
        }
      }
  symbol_next_states.sort();

      nfa_closed_transitions.push(
        new Transition(state, symbol_next_states, symbol)
      );
    }
  }

  nfa_closed_final_states.sort();

  // Special case for epsilon from initial state to a final state
  let initial_state_closure = obtain_E_Closure(nfa.initialState, nfa.transitions);
  let init_closure_has_final_state = false;

  for (let final_state of nfa.finalStates) {
    if (initial_state_closure.includes(final_state)) {
      init_closure_has_final_state = true;
      break;
    }
  }

  if (init_closure_has_final_state) {
    // Make the initial state final
    nfa.finalStates.push(nfa.initialState);
  }

  nfa = new NFA(nfa.initialState, nfa.finalStates, nfa.states, nfa.alphabet, nfa_closed_transitions);
  return nfa;
}

function obtain_E_Closure(state, transitions) {
  let e_closure = [];
  e_closure.push(state);
  for (let i = 0; i < transitions.length; i++) {
    let t = transitions[i];

    // epsilon transition
    if (t.symbol.trim() === "" || t.symbol.trim() === "\u03B5") {
      // The transition is going from our state
      if (state === t.state) {
        for (let j = 0; j < t.nextStates.length; j++) {
          // See if the state is part of the closure
          if (!e_closure.includes(t.nextStates[j])) {
            // If not, add it to the closure
            e_closure.push(t.nextStates[j]);
            // Then check the closure for the newly added state (recursive)
            let sub_e_closure = obtain_E_Closure(t.nextStates[j], transitions);

            for (let j = 0; j < sub_e_closure.length; j++) {
              if (!e_closure.includes(sub_e_closure[j])) {
                e_closure.push(sub_e_closure[j]);
              }
            }
          }
        }
      }
    }
  }

  return e_closure;
}

function generateDFA(nfa, step_counter_stop = -1) {
  let step_counter = 0;
  let step_interrupt = false;

  nfa = epsilonClosureNFA(nfa);

  let dfa_states = [];
  let dfa_final_states = [];
  let dfa_transitions = [];

  let stack = [];

  dfa_states.push(nfa.initialState);
  stack.push(nfa.initialState); // States we need to check/convert

  while (stack.length > 0) {
    let state = stack.pop();
    if (++step_counter === step_counter_stop) {
      step_interrupt = true;
      break;
    }
    let states;
    if (isMultiState(state)) {
      states = separateStates(state);
    } else {
      states = [];
      states.push(state);
    }

    for (let i = 0; i < nfa.alphabet.length; i++) {
      let next_states_union = [];

      for (let j = 0; j < states.length; j++) {
        let ns = findNextStates(states[j], nfa.alphabet[i], nfa.transitions);
        for (let k = 0; k < ns.length; k++)
          if (!next_states_union.includes(ns[k])) next_states_union.push(ns[k]);
      }
      let combinedStatesUnion = combineStates(next_states_union);

      if (combinedStatesUnion != null) {
        dfa_transitions.push(new Transition(state, combinedStatesUnion, nfa.alphabet[i])
        );

        if (!dfa_states.includes(combinedStatesUnion)) {
          dfa_states.push(combinedStatesUnion);
          stack.push(combinedStatesUnion);
        }
      } else {
        if (!dfa_states.includes("DEAD")) {
          for (let n = 0; n < nfa.alphabet.length; n++)
            dfa_transitions.push(
              new Transition("DEAD", ["DEAD"], nfa.alphabet[n])
            );

          dfa_states.push("DEAD");
        }

        dfa_transitions.push(new Transition(state, ["DEAD"], nfa.alphabet[i]));
      }
    }
  }

  for (let i = 0; i < dfa_states.length; i++) {
    let dfa_sep_states = separateStates(dfa_states[i]);

    for (let j = 0; j < nfa.finalStates.length; j++) {
      console.log(
        "Does " + dfa_sep_states + " include " + nfa.finalStates[j] + "?"
      );

      if (dfa_sep_states.includes(nfa.finalStates[j])) {
        dfa_final_states.push(nfa.formatDotState(dfa_states[i]));
        break;
      }
    }
  }

  if (!step_interrupt) {
    LAST_COMPLETED_STEP_COUNT = step_counter;
  }

  return new NFA(
    nfa.initialState,
    dfa_final_states,
    dfa_states,
    nfa.alphabet,
    dfa_transitions
  );
}

function findNextStates(state, symbol, transitions) {
  let next_states = [];

  for (let i = 0; i < transitions.length; i++) {
    let t = transitions[i];

    if (t.state === state && t.symbol === symbol) {
      for (let j = 0; j < t.nextStates.length; j++) {
        if (!next_states.includes(t.nextStates[j])) {
          next_states.push(t.nextStates[j]);
        }
      }
    }
  }

  return next_states;
}

function isMultiState(state) {
  state = state.toString();
  return state.startsWith("{") && state.endsWith("}");
}

function separateStates(state) {
  if (isMultiState(state)) {
    return state.substring(1, state.length - 1).split(",");
  } else {
    return state;
  }
}

function combineStates(states) {
  // Remove null entries from array
  states = states.filter(function (e) {
    return e != null;
  });

  if (states.length > 0 && Array.isArray(states[0])) {
      states = states[0];
  }
  if (states.length === 0) return null;

  states.sort();

  if (states.length === 1) return states[0].toString();

  let state = "{";
  for (let i = 0; i < states.length; i++) {
    state += states[i] + ",";
  }
  state = state.trim().replace(/,+$/, "");
  state += "}";

  return state;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;

  return true;
}
