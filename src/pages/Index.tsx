import { useState, useEffect, useRef } from "react";
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
import FunctionVisualizer from "@/components/FunctionVisualizer";

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
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ghidra-messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
    return [
      {
        id: "1",
        role: "system",
        content: "Ghidra AI Bridge готов к работе. Подключитесь к Ghidra и выберите AI-модель для начала анализа.",
        timestamp: new Date(),
      },
    ];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ghidra-projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        lastOpened: new Date(p.lastOpened)
      }));
    }
    return [
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
    ];
  });

  const aiModels = [
    { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
    { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta" },
    { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
  ];

  const handleConnect = async () => {
    if (!ghidraBridgeHost || !ghidraBridgePort) {
      toast.error("Заполните все поля подключения");
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/51ba8c1e-181e-42d4-bb06-4fc916f424c1', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      const data = await response.json();
      if (data.status === 'ready') {
        setIsConnected(true);
        toast.success("Успешно подключено к Ghidra Bridge");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: `Подключено к Ghidra Bridge на ${ghidraBridgeHost}:${ghidraBridgePort}. Статус: ${data.message}`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      toast.error("Не удалось подключиться к Ghidra Bridge");
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.info("Отключено от Ghidra Bridge");
  };

  useEffect(() => {
    localStorage.setItem('ghidra-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ghidra-projects', JSON.stringify(projects));
  }, [projects]);

  const handleExportChat = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      model: selectedModel,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghidra-chat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Диалог экспортирован');
  };

  const handleClearHistory = () => {
    setMessages([{
      id: Date.now().toString(),
      role: "system",
      content: "История очищена. Начните новый сеанс анализа.",
      timestamp: new Date(),
    }]);
    toast.info('История диалогов очищена');
  };

  const handleSendMessage = async () => {
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
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/f56d59e2-f820-41b0-a1ec-aff7358cae82', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'Ты - эксперт по реверс-инжинирингу и анализу бинарных файлов. Помогаешь анализировать код из дизассемблера Ghidra. Отвечай кратко и профессионально.'
            },
            ...messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: inputMessage
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обращении к AI');
      console.error('OpenRouter error:', error);
    } finally {
      setIsLoading(false);
    }
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="MessageSquare" size={20} />
                      Диалог с дизассемблером
                    </CardTitle>
                    <CardDescription>Задавайте вопросы о бинарном файле и получайте анализ от AI</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportChat}>
                      <Icon name="Download" size={16} className="mr-2" />
                      Экспорт
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearHistory}>
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Очистить
                    </Button>
                  </div>
                </div>
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
                    {isLoading && (
                      <div className="flex gap-3 justify-start animate-scale-in">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Bot" size={16} className="text-primary animate-pulse" />
                        </div>
                        <div className="bg-card border border-border p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">Анализирую...</p>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
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
                  <Button onClick={handleSendMessage} size="lg" className="px-6" disabled={isLoading}>
                    <Icon name={isLoading ? "Loader2" : "Send"} size={20} className={isLoading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <FunctionVisualizer />
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