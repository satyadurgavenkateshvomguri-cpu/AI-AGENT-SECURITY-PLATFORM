import ast
import operator
from typing import Dict, Any

# Safe arithmetic operators
OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos
}

def _eval_expr(node):
    if isinstance(node, ast.Num):
        return node.n
    elif isinstance(node, ast.Constant): # Python 3.8+
        return node.value
    elif isinstance(node, ast.BinOp):
        left = _eval_expr(node.left)
        right = _eval_expr(node.right)
        return OPERATORS[type(node.op)](left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = _eval_expr(node.operand)
        return OPERATORS[type(node.op)](operand)
    else:
        raise ValueError("Unsupported operation or code injection syntax detected.")

def safe_calculator(expression: str) -> Dict[str, Any]:
    try:
        # Check for obvious injection keywords
        dangerous_keywords = ["import", "os", "sys", "exec", "eval", "__", "lambda", "open", "system"]
        if any(kw in expression.lower() for kw in dangerous_keywords):
            return {
                "status": "error",
                "error_type": "CODE_INJECTION_DETECTED",
                "message": "Security Alert: Expression contains dangerous syntax or system execution instructions.",
                "classification": "PUBLIC"
            }

        node = ast.parse(expression.strip(), mode='eval').body
        result = _eval_expr(node)
        return {
            "status": "success",
            "expression": expression,
            "result": result,
            "classification": "PUBLIC"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Calculation error or invalid syntax: {str(e)}",
            "classification": "PUBLIC"
        }
