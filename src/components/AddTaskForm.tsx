
import { useState, useRef } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Mic, X } from "lucide-react";

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onCancel?: () => void;
}

const AddTaskForm = ({ onAddTask, onCancel }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'learning'>('personal');
  const [photo, setPhoto] = useState<string>("");
  const [audio, setAudio] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getXPReward = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 25;
      case 'hard': return 50;
      default: return 10;
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      category,
      xpReward: getXPReward(difficulty),
      photo: photo || undefined,
      audio: audio || undefined
    });

    setTitle("");
    setDescription("");
    setDifficulty('easy');
    setCategory('personal');
    setPhoto("");
    setAudio("");
  };

  return (
    <Card className="glass border-2">
      <CardHeader>
        <CardTitle className="gradient-text">Add New Quest</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Quest Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your quest..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          {/* Media Upload Section */}
          <div className="space-y-3">
            <Label>Media (Optional)</Label>
            
            {/* Photo Upload */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Add Photo
              </Button>
              
              {/* Audio Recording */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`flex items-center gap-2 ${isRecording ? 'bg-red-100 text-red-800' : ''}`}
              >
                <Mic className="w-4 h-4" />
                {isRecording ? 'Stop Recording' : 'Record Audio'}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Preview uploaded media */}
            <div className="space-y-2">
              {photo && (
                <div className="relative inline-block">
                  <img src={photo} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                    onClick={() => setPhoto("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {audio && (
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Audio recorded</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 rounded-full"
                    onClick={() => setAudio("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (+10 XP)</SelectItem>
                  <SelectItem value="medium">Medium (+25 XP)</SelectItem>
                  <SelectItem value="hard">Hard (+50 XP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="flex-1">
              Create Quest
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTaskForm;
