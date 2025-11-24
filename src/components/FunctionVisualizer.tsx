import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface FunctionNode {
  name: string;
  address: string;
  type: "entry" | "suspicious" | "normal" | "library";
  calls: number;
  complexity: number;
}

const FunctionVisualizer = () => {
  const functions: FunctionNode[] = [
    { name: "main", address: "0x401000", type: "entry", calls: 5, complexity: 8 },
    { name: "sub_401000", address: "0x401230", type: "suspicious", calls: 12, complexity: 25 },
    { name: "checkLicense", address: "0x401450", type: "normal", calls: 2, complexity: 4 },
    { name: "networkCall", address: "0x401680", type: "suspicious", calls: 8, complexity: 15 },
    { name: "printf", address: "0x402000", type: "library", calls: 3, complexity: 1 },
    { name: "decrypt", address: "0x401890", type: "suspicious", calls: 6, complexity: 18 },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entry":
        return "bg-accent text-accent-foreground";
      case "suspicious":
        return "bg-destructive text-destructive-foreground";
      case "normal":
        return "bg-primary text-primary-foreground";
      case "library":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getComplexityLevel = (complexity: number) => {
    if (complexity > 20) return { label: "Высокая", color: "text-destructive" };
    if (complexity > 10) return { label: "Средняя", color: "text-yellow-500" };
    return { label: "Низкая", color: "text-green-500" };
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Network" size={20} />
          Структура функций
        </CardTitle>
        <CardDescription>Визуализация вызовов и связей между функциями</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-accent/10 text-accent">
              <Icon name="Play" size={12} className="mr-1" />
              Entry Point
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive">
              <Icon name="AlertTriangle" size={12} className="mr-1" />
              Подозрительная
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Icon name="Code" size={12} className="mr-1" />
              Обычная
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              <Icon name="Package" size={12} className="mr-1" />
              Библиотечная
            </Badge>
          </div>

          <div className="relative">
            <div className="grid gap-3">
              {functions.map((func, index) => {
                const complexityInfo = getComplexityLevel(func.complexity);
                return (
                  <div
                    key={func.address}
                    className="relative group animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={`p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer ${getTypeColor(
                        func.type
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              name={
                                func.type === "entry"
                                  ? "Play"
                                  : func.type === "suspicious"
                                  ? "AlertTriangle"
                                  : func.type === "library"
                                  ? "Package"
                                  : "Code"
                              }
                              size={16}
                            />
                            <h4 className="font-mono font-semibold text-sm truncate">{func.name}</h4>
                          </div>
                          <p className="font-mono text-xs opacity-80 mb-2">{func.address}</p>
                          <div className="flex gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <Icon name="GitBranch" size={12} />
                              <span>{func.calls} вызовов</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="Gauge" size={12} />
                              <span className={complexityInfo.color}>
                                {complexityInfo.label} ({func.complexity})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-12 h-12 rounded-full border-4 border-current flex items-center justify-center font-bold"
                            style={{
                              opacity: Math.min(func.complexity / 30 + 0.3, 1),
                            }}
                          >
                            {func.complexity}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < functions.length - 1 && (
                      <div className="absolute left-8 top-full w-0.5 h-3 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Info" size={16} className="text-primary" />
              <span className="font-semibold">Анализ:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Обнаружено 3 подозрительные функции с высокой сложностью</li>
              <li>• Функция sub_401000 имеет 12 вызовов - рекомендуется детальный анализ</li>
              <li>• Обфусцированный код обнаружен в функциях decrypt и networkCall</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunctionVisualizer;
