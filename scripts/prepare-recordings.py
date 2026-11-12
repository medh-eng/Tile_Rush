"""Prepare the bundled CC0 piano excerpts and performance-onset cue data.
Optional authoring dependencies: numpy, scipy, ffmpeg. Normal game builds need none.
Original recordings stay in --source-dir; the game ships only attributed excerpts.
"""
from pathlib import Path
import argparse, hashlib, json, re, subprocess, urllib.request, urllib.parse, wave
import numpy as np
from scipy import signal, ndimage

ROOT=Path(__file__).resolve().parent.parent
SPECS=[
 ('bach-c-major','01 Prelude No. 1 in C major, BWV 846','Prelude in C',.62,.48,'Easy',1,43),
 ('bach-e-minor','19 Prelude No. 10 in E minor, BWV 855','Prelude in E minor',.65,.48,'Easy',1,-14),
 ('bach-c-minor','03 Prelude No. 2 in C minor, BWV 847','Prelude in C minor',.46,.36,'Medium',2,22),
]
def sha(data): return hashlib.sha256(data).hexdigest()
def build(source_dir):
 output=ROOT/'public/music';output.mkdir(parents=True,exist_ok=True)
 tracks=[];ledger=[]
 for ident,source_title,title,target_gap,min_gap,difficulty,level,shift in SPECS:
  name='Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier,_Book_1_-_'+source_title.replace(' ','_')+'.ogg'
  md5=hashlib.md5(name.encode()).hexdigest()
  url='https://upload.wikimedia.org/wikipedia/commons/'+md5[0]+'/'+md5[:2]+'/'+urllib.parse.quote(name)
  original=source_dir/(ident+'.ogg')
  if not original.exists():
   req=urllib.request.Request(url,headers={'User-Agent':'TileRush/0.4 CC0 recording preparation'})
   with urllib.request.urlopen(req,timeout=60) as response: original.write_bytes(response.read())
  data=original.read_bytes()
  if not data.startswith(b'OggS'):raise ValueError('Expected Ogg recording')
  wav=source_dir/(ident+'.wav')
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(original),'-t','55','-ar','22050','-ac','1',str(wav)],check=True)
  with wave.open(str(wav)) as f: x=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(float)/32768; sr=f.getframerate()
  _,times,z=signal.stft(x,sr,nperseg=1024,noverlap=896)
  mag=np.log1p(np.abs(z)*100);flux=np.r_[0,np.maximum(np.diff(mag,axis=1),0).sum(axis=0)]
  flux=np.maximum(0,flux-ndimage.median_filter(flux,size=25))
  peaks,_=signal.find_peaks(flux,distance=int(.1*sr/128),prominence=np.percentile(flux,75)*.65)
  onsets=times[peaks];strengths=flux[peaks]
  start=max(0,float(onsets[0])-.06);duration=48.0
  usable=(onsets>=start)&(onsets<start+duration-1.6)
  onsets=onsets[usable]-start;strengths=strengths[usable]
  chosen=[0];cursor=0
  # Pick an audible attack near each target hop, never a rigid metronome grid.
  while True:
   candidates=np.flatnonzero((onsets>=onsets[cursor]+min_gap)&(onsets<=onsets[cursor]+target_gap+.20))
   if not len(candidates):break
   costs=np.abs(onsets[candidates]-(onsets[cursor]+target_gap))-.025*strengths[candidates]/max(strengths.max(),1e-9)
   cursor=int(candidates[np.argmin(costs)]);chosen.append(cursor)
  cues=[round(float(onsets[i]),4) for i in chosen]
  assert len(cues)>55 and all(b-a>=min_gap-.001 for a,b in zip(cues,cues[1:]))
  clip=output/(ident+'.mp3')
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(original),'-ss',str(round(start,6)),'-t',str(duration),'-af','afade=t=in:st=0:d=0.025,afade=t=out:st=46.5:d=1.5','-ar','44100','-ac','2','-codec:a','libmp3lame','-b:a','96k','-map_metadata','-1',str(clip)],check=True)
  stats=subprocess.run(['ffmpeg','-hide_banner','-i',str(clip),'-af','volumedetect','-f','null','-'],capture_output=True,text=True,check=True).stderr
  mean=float(re.search(r'mean_volume: ([-.0-9]+)',stats).group(1));peak=float(re.search(r'max_volume: ([-.0-9]+)',stats).group(1))
  gain_db=round(min(-21-mean,-2-peak),2)
  # Constant gain only: preserve all the pianist's dynamics, with peak headroom.
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(original),'-ss',str(round(start,6)),'-t',str(duration),'-af',f'volume={gain_db}dB,afade=t=in:st=0:d=0.025,afade=t=out:st=46.5:d=1.5','-ar','44100','-ac','2','-codec:a','libmp3lame','-b:a','96k','-map_metadata','-1',str(clip)],check=True)
  bpm=round(60/float(np.median(np.diff(cues))))
  entry={'id':ident,'title':title,'work':source_title[3:],'performer':'Kimiko Ishizaka','composer':'Johann Sebastian Bach','license':'CC0-1.0','licenseUrl':'https://creativecommons.org/publicdomain/zero/1.0/','sourcePage':'https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(name),'sourceUrl':url,'sourceSha256':sha(data),'sourceBytes':len(data),'clipSha256':sha(clip.read_bytes()),'clipBytes':clip.stat().st_size,'excerptStart':round(start,6),'duration':duration,'constantGainDb':gain_db,'changes':'Opening excerpt; constant playback gain (see constantGainDb);  25 ms fade-in; 1.5 s fade-out; stereo MP3 at 96 kbps. No quantisation, pitch change or time stretch.','verifiedOn':'2026-11-12'}
  ledger.append(entry)
  tracks.append({'id':ident,'title':title,'work':entry['work'],'artist':'Kimiko Ishizaka · J. S. Bach','performer':entry['performer'],'genre':'piano','no':len(tracks)+1,'difficulty':difficulty,'level':level,'bpm':bpm,'root':60,'scale':'major','prog':[0],'theme':'aurora','shift':shift,'speed':6.2 if level==1 else 7,'minGap':min_gap,'reach':1.5 if level==1 else 1.8,'recording':{'src':'./public/music/'+ident+'.mp3','duration':duration,'cues':cues,'sourcePage':entry['sourcePage'],'license':entry['license']}})
  print(ident,len(cues),'cues',bpm,'approx BPM',clip.stat().st_size,'bytes',flush=True)
 (output/'rights.json').write_text(json.dumps(ledger,indent=2)+'\n')
 (ROOT/'src/recording-data.js').write_text('// Generated by scripts/prepare-recordings.py. Real CC0 performances; see public/music/rights.json.\nexport const PIANO_TRACKS = '+json.dumps(tracks,indent=2,ensure_ascii=False)+';\n')
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--source-dir',type=Path,default=ROOT.parent/'music-sources');args=parser.parse_args();args.source_dir.mkdir(parents=True,exist_ok=True);build(args.source_dir)
