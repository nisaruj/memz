#Get vocab.txt from http://www.denisowski.org/Japanese/MNN_1/MNN_1.html
#name txt file as "minna<id>.txt" 
lesson = 3
f = open('minna'+str(lesson)+'.txt', encoding="utf8")
_id = 1
out=""
head = "{ lesson_id: " + str(lesson) + ",\n course: 'Minna no Nihongo',\n name: 'Lesson "+str(lesson)+"',\n" 
for line in f :
    if line.find('#') > -1 : continue
    s = line.find('[')
    ms = line.find('/')
    out += "{ id: " + str(_id) + ", word: '" + line[s+1:line.find(']',s)] + "' ,meaning: '" + \
            line[ms+1:line.find('/',ms+1)] + "' }, \n"
    _id+=1
head += " vocab_size: " + str(_id-1) + ",\n vocab: ["
print(head+out[:len(out)-3]+']}')
    
