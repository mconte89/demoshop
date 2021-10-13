import M from "../strings";
import Colors from "./colors";

export function getResultColor(test) {
    let resultColor = Colors.warning;
    switch (test.result) {
        case "positive":
            resultColor = Colors.error;
            break;
        case "negative":
            resultColor = Colors.success;
    }
    return resultColor;
}

export function getResultText(test) {
    let resultText = M("resultUnknown");
    switch (test.result) {
        case "positive":
            resultText = M("resultPositive");
            break;
        case "negative":
            resultText = M("resultNegative")
    }

    return resultText;
}