import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
}

const Index = () => {
  const [ghidraBridgeHost, setGhidraBridgeHost] = useState("127.0.0.1");
  const [ghidraBridgePort, setGhidraBridgePort] = useState("13100");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Ghidra AI Bridge готов к работе. Подключитесь к Ghidra и выберите AI-модель для начала анализа.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "malware_sample_2024",
      path: "C:\\ghidra_projects\\malware_sample_2024",
      lastOpened: new Date("2024-11-20"),
    },
    {
      id: "2",
      name: "firmware_analysis",
      path: "C:\\ghidra_projects\\firmware_analysis",
      lastOpened: new Date("2024-11-18"),
    },
  ]);

  const aiModels = [
    { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
    { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta" },
    { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
  ];

  const handleConnect = () => {
    if (!ghidraBridgeHost || !ghidraBridgePort) {
      toast.error("Заполните все поля подключения");
      return;
    }
    setIsConnected(true);
    toast.success("Успешно подключено к Ghidra Bridge");
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "system",
        content: `Подключено к Ghidra Bridge на ${ghidraBridgeHost}:${ghidraBridgePort}`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.info("Отключено от Ghidra Bridge");
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    if (!isConnected) {
      toast.error("Сначала подключитесь к Ghidra Bridge");
      return;
    }
    if (!selectedModel) {
      toast.error("Выберите AI-модель");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Анализирую запрос: "${inputMessage}". В текущем бинарном файле обнаружено 3 функции с подозрительными паттернами. Функция sub_401000 содержит обфусцированный код и вызовы API для работы с сетью. Рекомендую исследовать строки и импорты подробнее.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Binary" size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ghidra AI Bridge</h1>
              <p className="text-muted-foreground">Интеллектуальный анализ дизассемблированного кода</p>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="px-4 py-2">
            {isConnected ? (
              <>
                <Icon name="Zap" size={14} className="mr-2" />
                Подключено
              </>
            ) : (
              <>
                <Icon name="ZapOff" size={14} className="mr-2" />
                Не подключено
              </>
            )}
          </Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" size={20} />
                  Диалог с дизассемблером
                </CardTitle>
                <CardDescription>Задавайте вопросы о бинарном файле и получайте анализ от AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        } animate-scale-in`}
                      >
                        {message.role !== "user" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon
                              name={message.role === "system" ? "Info" : "Bot"}
                              size={16}
                              className="text-primary"
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.role === "system"
                              ? "bg-muted text-muted-foreground"
                              : "bg-card border border-border"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString("ru-RU")}
                          </span>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Icon name="User" size={16} className="text-accent" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Например: Найди все функции с сетевыми вызовами..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px]"
                  />
                  <Button onClick={handleSendMessage} size="lg" className="px-6">
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="connection" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connection">
                  <Icon name="Link" size={16} className="mr-2" />
                  Подключение
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <Icon name="FolderOpen" size={16} className="mr-2" />
                  Проекты
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ghidra Bridge</CardTitle>
                    <CardDescription>Настройки подключения к Ghidra</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Хост</Label>
                      <Input
                        id="host"
                        value={ghidraBridgeHost}
                        onChange={(e) => setGhidraBridgeHost(e.target.value)}
                        disabled={isConnected}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Порт</Label>
                      <Input
                        id="port"
                        value={ghidraBridgePort}
                        onChange={(e) => setGhidraBridgePort(e.target.value)}
                        disabled={isConnected}
                      />
                    </div>
                    {isConnected ? (
                      <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                        <Icon name="Unplug" size={16} className="mr-2" />
                        Отключиться
                      </Button>
                    ) : (
                      <Button onClick={handleConnect} className="w-full">
                        <Icon name="Plug" size={16} className="mr-2" />
                        Подключиться
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">OpenRouter API</CardTitle>
                    <CardDescription>Настройки AI-моделей</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apikey">API Key</Label>
                      <Input
                        id="apikey"
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={openRouterKey}
                        onChange={(e) => setOpenRouterKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">AI-модель</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger id="model">
                          <SelectValue placeholder="Выберите модель" />
                        </SelectTrigger>
                        <SelectContent>
                          {aiModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex items-center gap-2">
                                <Icon name="Brain" size={14} />
                                <span>{model.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {model.provider}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedModel && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="CheckCircle" size={16} className="text-primary" />
                          <span className="text-primary font-medium">Модель выбрана</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Недавние проекты</CardTitle>
                    <CardDescription>Быстрый доступ к проектам Ghidra</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <Icon name="Folder" size={20} className="text-accent mt-1" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{project.name}</h4>
                              <p className="text-xs text-muted-foreground truncate mt-1">{project.path}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Открыт: {project.lastOpened.toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Открыть проект
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Статистика</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Всего проектов</span>
                      <span className="text-lg font-bold">{projects.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Запросов к AI</span>
                      <span className="text-lg font-bold">
                        {messages.filter((m) => m.role === "user").length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
